import "server-only";
import {
  bracketSize,
  contestTimeline,
  firstRound,
  isDecided,
  matchupWinner,
  nextRound,
  roundCount,
  roundSchedule,
  seedEntries,
  weekStartOf,
  type PlannedMatchup,
} from "@/app/[locale]/utils/contestBracket";
import { fetchAllRows } from "@/app/[locale]/utils/animalLists";
import { seededIndex } from "@/app/[locale]/utils/seededIndex";
import type { Json } from "@/utils/supabase/database.types";
import { createAdminClient } from "@/utils/supabase/admin";
import type { Tables, TypedSupabaseClient } from "@/utils/supabase/types";
import {
  ANIMAL_IMAGE_FIELDS,
  publishAnimalImages,
  removeAnimalImages,
  userPhotoCredit,
} from "@/utils/lexicon/animalImages";
import { CONTEST_BUCKET } from "./storage";

export type AdvanceReport = {
  opened: number;
  seeded: number;
  cancelled: number;
  decided: number;
  finished: number;
};

type Contest = Tables<"contests">;
type Matchup = Tables<"contest_matchups">;

const toPlannedRow = (contestId: string, window: { startsAt: Date; endsAt: Date }) => (m: PlannedMatchup) => ({
  contest_id: contestId,
  round: m.round,
  slot: m.slot,
  entry_a: m.entryA,
  entry_b: m.entryB,
  winner: m.winner,
  starts_at: window.startsAt.toISOString(),
  ends_at: window.endsAt.toISOString(),
});

/** Inserts planned matchups; a concurrent run that got there first is fine. */
async function insertMatchups(admin: TypedSupabaseClient, rows: ReturnType<ReturnType<typeof toPlannedRow>>[]) {
  const { error } = await admin
    .from("contest_matchups")
    .upsert(rows, { onConflict: "contest_id,round,slot", ignoreDuplicates: true });
  if (error) throw new Error(`Inserting matchups failed: ${error.message}`);
}

/**
 * Copies the winning photo into the lexicon and credits its photographer.
 * Returns what the veto needs to undo it.
 */
async function publishWinner(admin: TypedSupabaseClient, contest: Contest, winnerId: string) {
  const [{ data: entry }, { data: animal }] = await Promise.all([
    admin.from("contest_entries").select("user_id, thumb_path, main_path").eq("id", winnerId).maybeSingle(),
    admin.from("animals").select("*").eq("id", contest.animal_id).maybeSingle(),
  ]);
  if (!entry?.thumb_path || !entry.main_path || !animal) throw new Error("Winning photo or animal missing");

  const [thumb, main] = await Promise.all(
    [entry.thumb_path, entry.main_path].map(async (path) => {
      const { data, error } = await admin.storage.from(CONTEST_BUCKET).download(path);
      if (error || !data) throw new Error(`Downloading ${path} failed`);
      return { data, contentType: data.type || "image/jpeg", extension: path.split(".").pop() ?? "jpg" };
    }),
  );

  const published = await publishAnimalImages(admin, animal.category, { thumb, main });
  const { error } = await admin
    .from("animals")
    .update({
      image_link: published.image_link,
      lexicon_link: published.lexicon_link,
      ...(await userPhotoCredit(admin, entry.user_id)),
    })
    .eq("id", animal.id);
  if (error) {
    await removeAnimalImages(admin, published.paths);
    throw new Error(`Updating the lexicon image failed: ${error.message}`);
  }

  const previous = Object.fromEntries(ANIMAL_IMAGE_FIELDS.map((field) => [field, animal[field]]));
  return { previous: previous as Json, paths: published.paths };
}

/**
 * Closes ended matchups, opens the next round once a round is decided, and
 * finishes the contest after the final. Loops, since a round of forfeits can
 * decide the next one straight away.
 */
async function advanceBracket(admin: TypedSupabaseClient, contest: Contest, now: Date, report: AdvanceReport) {
  if (!contest.bracket_size) return;
  const rounds = roundCount(contest.bracket_size);
  const windows = roundSchedule(rounds, contestTimeline(contest.week_start).votingStart);

  const [{ data: entryRows }, { data: matchupRows }] = await Promise.all([
    admin.from("contest_entries").select("id, status, seed").eq("contest_id", contest.id),
    admin.from("contest_matchups").select("*").eq("contest_id", contest.id).order("round").order("slot"),
  ]);
  const matchups: Matchup[] = matchupRows ?? [];
  const entries = new Map((entryRows ?? []).map((entry) => [entry.id, entry]));
  const live = (id: string | null) => id !== null && entries.get(id)?.status === "active";

  // Votes only exist for matchups already created; later rounds start at zero.
  const votes = matchups.length
    ? await fetchAllRows(
        (from, to) =>
          admin
            .from("contest_votes")
            .select("matchup_id, user_id, entry_id")
            .in(
              "matchup_id",
              matchups.map((m) => m.id),
            )
            .order("matchup_id")
            .order("user_id")
            .range(from, to),
        "contest votes",
      )
    : [];
  const tally = new Map<string, number>();
  for (const vote of votes) {
    const key = `${vote.matchup_id}:${vote.entry_id}`;
    tally.set(key, (tally.get(key) ?? 0) + 1);
  }

  for (let round = 1; round <= rounds; round++) {
    let current = matchups.filter((m) => m.round === round);

    if (current.length === 0) {
      const previous = matchups.filter((m) => m.round === round - 1);
      if (previous.length === 0 || !previous.every((m) => isDecided({ entryA: m.entry_a, entryB: m.entry_b, winner: m.winner }))) {
        return;
      }
      await insertMatchups(
        admin,
        nextRound(
          previous.map((m) => m.winner),
          round,
        ).map(toPlannedRow(contest.id, windows[round - 1])),
      );
      const { data: inserted } = await admin
        .from("contest_matchups")
        .select("*")
        .match({ contest_id: contest.id, round })
        .order("slot");
      current = inserted ?? [];
      matchups.push(...current);
    }

    for (const m of current) {
      if (isDecided({ entryA: m.entry_a, entryB: m.entry_b, winner: m.winner })) continue;
      // A taken-down entry forfeits at once; otherwise the round has to end.
      const forfeit = !live(m.entry_a) || !live(m.entry_b);
      if (!forfeit && new Date(m.ends_at) > now) continue;

      const winner = matchupWinner({
        entryA: m.entry_a,
        entryB: m.entry_b,
        votesA: tally.get(`${m.id}:${m.entry_a}`) ?? 0,
        votesB: tally.get(`${m.id}:${m.entry_b}`) ?? 0,
        seedA: m.entry_a ? (entries.get(m.entry_a)?.seed ?? null) : null,
        seedB: m.entry_b ? (entries.get(m.entry_b)?.seed ?? null) : null,
        liveA: live(m.entry_a),
        liveB: live(m.entry_b),
      });
      // Neither side can go on: record it as decided by clearing both sides.
      const update = winner ? { winner } : { entry_a: null, entry_b: null };
      const { error } = await admin.from("contest_matchups").update(update).eq("id", m.id).is("winner", null);
      if (error) throw new Error(`Deciding matchup failed: ${error.message}`);
      Object.assign(m, update);
      report.decided += 1;
    }

    if (!current.every((m) => isDecided({ entryA: m.entry_a, entryB: m.entry_b, winner: m.winner }))) return;
  }

  // The final is decided.
  const final = matchups.find((m) => m.round === rounds);
  const winnerId = final?.winner ?? null;
  let published: Awaited<ReturnType<typeof publishWinner>> | null = null;
  if (winnerId && live(winnerId)) {
    try {
      published = await publishWinner(admin, contest, winnerId);
    } catch (error) {
      // The contest still finishes; an admin can see it has no lexicon change.
      console.error("Publishing the contest winner failed", error);
    }
  }
  const { error } = await admin
    .from("contests")
    .update({
      status: "finished",
      winner_entry_id: winnerId,
      previous_image: published?.previous ?? null,
      published_paths: published?.paths ?? [],
    })
    .match({ id: contest.id, status: "voting" });
  if (error) throw new Error(`Finishing contest failed: ${error.message}`);
  report.finished += 1;
}

/** Seeds the bracket of a contest whose entry week is over, or cancels it. */
async function seedContest(admin: TypedSupabaseClient, contest: Contest, report: AdvanceReport) {
  const { data: entryRows } = await admin
    .from("contest_entries")
    .select("id, created_at")
    .match({ contest_id: contest.id, status: "active" });
  const entries = entryRows ?? [];
  const likes = entries.length
    ? await fetchAllRows(
        (from, to) =>
          admin
            .from("contest_entry_likes")
            .select("entry_id, user_id")
            .in(
              "entry_id",
              entries.map((entry) => entry.id),
            )
            .order("entry_id")
            .order("user_id")
            .range(from, to),
        "contest likes",
      )
    : [];
  const likeCounts = new Map<string, number>();
  for (const like of likes) likeCounts.set(like.entry_id, (likeCounts.get(like.entry_id) ?? 0) + 1);

  const size = bracketSize(entries.length);
  if (!size) {
    await admin.from("contests").update({ status: "cancelled" }).match({ id: contest.id, status: "submission" });
    report.cancelled += 1;
    return null;
  }

  const seeded = seedEntries(
    entries.map((entry) => ({ id: entry.id, likes: likeCounts.get(entry.id) ?? 0, createdAt: entry.created_at })),
    size,
  );
  // Seeds are written one by one: there are at most 64.
  await Promise.all(
    seeded.map((entry, index) => admin.from("contest_entries").update({ seed: index + 1 }).eq("id", entry.id)),
  );
  // Entries that miss the cut are left out of the bracket.
  const cut = entries.filter((entry) => !seeded.some((seed) => seed.id === entry.id));
  if (cut.length) {
    await admin
      .from("contest_entries")
      .update({ status: "excluded" })
      .in(
        "id",
        cut.map((entry) => entry.id),
      );
  }

  const [window] = roundSchedule(roundCount(size), contestTimeline(contest.week_start).votingStart);
  await insertMatchups(
    admin,
    firstRound(
      seeded.map((entry) => entry.id),
      size,
    ).map(toPlannedRow(contest.id, window)),
  );

  const { data: updated, error } = await admin
    .from("contests")
    .update({ status: "voting", bracket_size: size })
    .match({ id: contest.id, status: "submission" })
    .select("*")
    .maybeSingle();
  if (error) throw new Error(`Starting the bracket failed: ${error.message}`);
  report.seeded += 1;
  return updated;
}

/** A species for a week nobody scheduled: well photographed, not contested in the past year. */
async function pickSpecies(admin: TypedSupabaseClient, weekStart: string): Promise<number | null> {
  const { data: candidates, error } = await admin.rpc("contest_candidates", { p_week_start: weekStart, p_limit: 20 });
  if (error) console.error("Error loading contest candidates", error);
  if (candidates?.length) return candidates[seededIndex(`contest:${weekStart}`, candidates.length)].animal_id;

  // No collection photos yet: any species with a lexicon image.
  const { data: animals } = await admin.from("animals").select("id").not("lexicon_link", "is", null).order("id");
  return animals?.length ? animals[seededIndex(`contest:${weekStart}`, animals.length)].id : null;
}

/** Makes sure this week's contest exists and takes entries. */
async function openWeek(admin: TypedSupabaseClient, weekStart: string, report: AdvanceReport) {
  // Scheduled weeks that were never opened are past saving.
  await admin.from("contests").update({ status: "cancelled" }).eq("status", "scheduled").lt("week_start", weekStart);

  const { data: existing } = await admin
    .from("contests")
    .select("id, status")
    .eq("week_start", weekStart)
    .maybeSingle();
  if (existing) {
    if (existing.status === "scheduled") {
      await admin.from("contests").update({ status: "submission" }).eq("id", existing.id);
      report.opened += 1;
    }
    return;
  }

  const animalId = await pickSpecies(admin, weekStart);
  if (animalId === null) return;
  const { data: inserted, error } = await admin
    .from("contests")
    .upsert({ animal_id: animalId, week_start: weekStart, status: "submission" }, {
      onConflict: "week_start",
      ignoreDuplicates: true,
    })
    .select("id");
  if (error) throw new Error(`Opening this week's contest failed: ${error.message}`);
  if (inserted?.length) report.opened += 1;
}

/**
 * Moves every contest along: seeds brackets whose entry week is over, closes
 * ended matchups and finishes contests after their final, then opens this
 * week's contest. Idempotent, so the daily cron and an admin's "advance now"
 * can both call it at any time.
 */
export async function advanceContests(now = new Date()): Promise<AdvanceReport> {
  const admin = createAdminClient();
  const report: AdvanceReport = { opened: 0, seeded: 0, cancelled: 0, decided: 0, finished: 0 };
  const thisWeek = weekStartOf(now);

  const { data: open, error } = await admin
    .from("contests")
    .select("*")
    .in("status", ["submission", "voting"])
    .order("week_start");
  if (error) throw new Error(`Loading contests failed: ${error.message}`);

  for (const contest of open ?? []) {
    let current: Contest | null = contest;
    if (current.status === "submission" && current.week_start < thisWeek) {
      current = await seedContest(admin, current, report);
    }
    if (current?.status === "voting") await advanceBracket(admin, current, now, report);
  }

  await openWeek(admin, thisWeek, report);
  return report;
}
