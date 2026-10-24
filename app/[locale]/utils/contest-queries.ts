import { CONTEST_BUCKET } from "@/utils/contest/storage";
import type { Tables, TypedSupabaseClient } from "@/utils/supabase/types";
import { fetchAllRows } from "./animalLists";

export type ContestStatus = "scheduled" | "submission" | "voting" | "finished" | "cancelled";

export type ContestSummary = {
  id: string;
  weekStart: string;
  status: ContestStatus;
  bracketSize: number | null;
  winnerEntryId: string | null;
  vetoed: boolean;
  animal: {
    id: number;
    commonName: string;
    scientificName: string;
    lexiconLink: string | null;
    imageLink: string | null;
  } | null;
};

export type EntryView = {
  id: string;
  userId: string;
  username: string | null;
  status: string;
  seed: number | null;
  thumbUrl: string | null;
  mainUrl: string | null;
  likes: number;
  likedByMe: boolean;
  isMine: boolean;
};

export type MatchupView = {
  id: string;
  round: number;
  slot: number;
  entryA: string | null;
  entryB: string | null;
  winner: string | null;
  startsAt: string;
  endsAt: string;
  /** Both sides are set, no winner yet, and the voting window is now. */
  open: boolean;
  /** Null while hidden: the matchup is open and the viewer has not voted. */
  votesA: number | null;
  votesB: number | null;
  myVote: string | null;
};

const CONTEST_COLUMNS =
  "id, week_start, status, bracket_size, winner_entry_id, vetoed_at, animals(id, common_name, scientific_name, lexicon_link, image_link)";

type ContestRow = Pick<
  Tables<"contests">,
  "id" | "week_start" | "status" | "bracket_size" | "winner_entry_id" | "vetoed_at"
> & {
  animals: Pick<Tables<"animals">, "id" | "common_name" | "scientific_name" | "lexicon_link" | "image_link"> | null;
};

const toSummary = (row: ContestRow): ContestSummary => ({
  id: row.id,
  weekStart: row.week_start,
  status: row.status as ContestStatus,
  bracketSize: row.bracket_size,
  winnerEntryId: row.winner_entry_id,
  vetoed: row.vetoed_at !== null,
  animal: row.animals && {
    id: row.animals.id,
    commonName: row.animals.common_name,
    scientificName: row.animals.scientific_name,
    lexiconLink: row.animals.lexicon_link,
    imageLink: row.animals.image_link,
  },
});

/** Contests in the given states, newest week first. */
export async function getContests(
  supabase: TypedSupabaseClient,
  statuses: ContestStatus[],
  limit = 20,
): Promise<ContestSummary[]> {
  const { data, error } = await supabase
    .from("contests")
    .select(CONTEST_COLUMNS)
    .in("status", statuses)
    .order("week_start", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("Error loading contests", error);
    return [];
  }
  return data.map(toSummary);
}

export async function getContest(supabase: TypedSupabaseClient, id: string): Promise<ContestSummary | null> {
  const { data, error } = await supabase.from("contests").select(CONTEST_COLUMNS).eq("id", id).maybeSingle();
  if (error) console.error("Error loading contest", error);
  return data ? toSummary(data) : null;
}

const publicUrl = (supabase: TypedSupabaseClient, path: string | null) =>
  path ? supabase.storage.from(CONTEST_BUCKET).getPublicUrl(path).data.publicUrl : null;

/** Usernames by user id; the entries reference auth users, not the users table. */
async function getUsernames(supabase: TypedSupabaseClient, ids: string[]) {
  if (ids.length === 0) return new Map<string, string>();
  const { data, error } = await supabase.from("users").select("id, display_name").in("id", ids);
  if (error) console.error("Error loading usernames", error);
  return new Map((data ?? []).map((user) => [user.id, user.display_name]));
}

/**
 * A contest's entries as the viewer may see them: every live entry plus the
 * viewer's own in any state. Most liked first.
 */
export async function getEntries(
  supabase: TypedSupabaseClient,
  contestId: string,
  viewerId: string,
): Promise<EntryView[]> {
  const { data, error } = await supabase
    .from("contest_entries")
    .select("id, user_id, status, seed, thumb_path, main_path, created_at")
    .eq("contest_id", contestId)
    .order("created_at");
  if (error) {
    console.error("Error loading contest entries", error);
    return [];
  }
  // Admins can read every entry; the gallery still only shows what users see.
  const rows = data.filter((row) => row.status === "active" || row.user_id === viewerId);

  const [likes, names] = await Promise.all([
    rows.length
      ? fetchAllRows(
          (from, to) =>
            supabase
              .from("contest_entry_likes")
              .select("entry_id, user_id")
              .in(
                "entry_id",
                rows.map((row) => row.id),
              )
              .order("entry_id")
              .order("user_id")
              .range(from, to),
          "contest likes",
        )
      : [],
    getUsernames(supabase, [...new Set(rows.map((row) => row.user_id))]),
  ]);

  const likeCounts = new Map<string, number>();
  const likedByMe = new Set<string>();
  for (const like of likes) {
    likeCounts.set(like.entry_id, (likeCounts.get(like.entry_id) ?? 0) + 1);
    if (like.user_id === viewerId) likedByMe.add(like.entry_id);
  }

  return rows
    .map((row) => ({
      id: row.id,
      userId: row.user_id,
      username: names.get(row.user_id) ?? null,
      status: row.status,
      seed: row.seed,
      thumbUrl: publicUrl(supabase, row.thumb_path),
      mainUrl: publicUrl(supabase, row.main_path),
      likes: likeCounts.get(row.id) ?? 0,
      likedByMe: likedByMe.has(row.id),
      isMine: row.user_id === viewerId,
    }))
    .sort((a, b) => b.likes - a.likes);
}

/** A contest's matchups with the vote counts the viewer may see and their own votes. */
export async function getBracket(
  supabase: TypedSupabaseClient,
  contestId: string,
  viewerId: string,
): Promise<MatchupView[]> {
  const { data: matchups, error } = await supabase
    .from("contest_matchups")
    .select("id, round, slot, entry_a, entry_b, winner, starts_at, ends_at")
    .eq("contest_id", contestId)
    .order("round")
    .order("slot");
  if (error) {
    console.error("Error loading matchups", error);
    return [];
  }
  if (matchups.length === 0) return [];

  const [{ data: counts, error: countError }, { data: votes, error: voteError }] = await Promise.all([
    supabase.rpc("contest_vote_counts", { p_contest_id: contestId }),
    supabase
      .from("contest_votes")
      .select("matchup_id, entry_id")
      .eq("user_id", viewerId)
      .in(
        "matchup_id",
        matchups.map((m) => m.id),
      ),
  ]);
  if (countError || voteError) console.error("Error loading votes", countError ?? voteError);

  const visible = new Map<string, Map<string, number>>();
  for (const row of counts ?? []) {
    const byEntry = visible.get(row.matchup_id) ?? new Map<string, number>();
    byEntry.set(row.entry_id, row.votes);
    visible.set(row.matchup_id, byEntry);
  }
  const mine = new Map((votes ?? []).map((vote) => [vote.matchup_id, vote.entry_id]));
  const now = Date.now();

  return matchups.map((m) => {
    // Counts are visible once the matchup is over or the viewer voted, even
    // when nobody voted (the function then returns no rows).
    const shown = visible.has(m.id) || mine.has(m.id) || m.winner !== null || Date.parse(m.ends_at) <= now;
    const count = (entry: string | null) => (shown ? (entry ? (visible.get(m.id)?.get(entry) ?? 0) : 0) : null);
    return {
      id: m.id,
      round: m.round,
      slot: m.slot,
      entryA: m.entry_a,
      entryB: m.entry_b,
      winner: m.winner,
      startsAt: m.starts_at,
      endsAt: m.ends_at,
      open:
        m.winner === null &&
        m.entry_a !== null &&
        m.entry_b !== null &&
        Date.parse(m.starts_at) <= now &&
        now < Date.parse(m.ends_at),
      votesA: count(m.entry_a),
      votesB: count(m.entry_b),
      myVote: mine.get(m.id) ?? null,
    };
  });
}

export type Winner = ContestSummary & { entry: Pick<EntryView, "id" | "username" | "thumbUrl" | "mainUrl" | "userId"> };

/** Finished contests with a live winning photo, newest first. */
export async function getWinners(supabase: TypedSupabaseClient, limit = 12): Promise<Winner[]> {
  const contests = (await getContests(supabase, ["finished"], limit)).filter((c) => c.winnerEntryId);
  if (contests.length === 0) return [];

  const { data, error } = await supabase
    .from("contest_entries")
    .select("id, user_id, thumb_path, main_path")
    .in(
      "id",
      contests.map((c) => c.winnerEntryId!),
    )
    .eq("status", "active");
  if (error) console.error("Error loading winning entries", error);

  const names = await getUsernames(supabase, [...new Set((data ?? []).map((row) => row.user_id))]);
  const entries = new Map((data ?? []).map((row) => [row.id, row]));
  return contests.flatMap((contest) => {
    const entry = entries.get(contest.winnerEntryId!);
    return entry
      ? [
          {
            ...contest,
            entry: {
              id: entry.id,
              userId: entry.user_id,
              username: names.get(entry.user_id) ?? null,
              thumbUrl: publicUrl(supabase, entry.thumb_path),
              mainUrl: publicUrl(supabase, entry.main_path),
            },
          },
        ]
      : [];
  });
}
