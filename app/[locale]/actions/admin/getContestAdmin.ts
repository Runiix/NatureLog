"use server";

import requireAdmin from "@/utils/supabase/requireAdmin";
import { CONTEST_BUCKET } from "@/utils/contest/storage";
import { addWeeks, weekStartOf } from "@/app/[locale]/utils/contestBracket";
import { getContests, type ContestSummary } from "@/app/[locale]/utils/contest-queries";

const PLANNING_WEEKS = 8;

export type AdminEntry = {
  id: string;
  status: string;
  username: string | null;
  thumbUrl: string | null;
};

export type ContestAdminData = {
  /** Mondays an admin can still schedule, from next week on. */
  weeks: string[];
  scheduled: ContestSummary[];
  submission: (ContestSummary & { entries: AdminEntry[] }) | null;
  finished: (ContestSummary & { winnerName: string | null; published: boolean })[];
  animals: { id: number; name: string }[];
};

/** Everything the admin Contests tab shows. */
export default async function getContestAdmin(): Promise<ContestAdminData> {
  const { supabase } = await requireAdmin();
  const nextWeek = addWeeks(weekStartOf(new Date()), 1);

  const [scheduled, [submission], finished, { data: animals }, { data: rawFinished }] = await Promise.all([
    getContests(supabase, ["scheduled"], 50),
    getContests(supabase, ["submission"], 1),
    getContests(supabase, ["finished"], 10),
    supabase.from("animals").select("id, common_name").not("lexicon_link", "is", null).order("common_name"),
    supabase
      .from("contests")
      .select("id, published_paths, winner_entry_id")
      .eq("status", "finished")
      .order("week_start", { ascending: false })
      .limit(10),
  ]);

  // Admins read entries in every state (RLS), including pending and excluded.
  const { data: entryRows } = submission
    ? await supabase
        .from("contest_entries")
        .select("id, user_id, status, thumb_path")
        .eq("contest_id", submission.id)
        .order("created_at")
    : { data: [] };
  const winnerIds = (rawFinished ?? []).flatMap((row) => (row.winner_entry_id ? [row.winner_entry_id] : []));
  const { data: winners } = winnerIds.length
    ? await supabase.from("contest_entries").select("id, user_id").in("id", winnerIds)
    : { data: [] };

  const userIds = [...new Set([...(entryRows ?? []), ...(winners ?? [])].map((row) => row.user_id))];
  const { data: users } = userIds.length
    ? await supabase.from("users").select("id, display_name").in("id", userIds)
    : { data: [] };
  const names = new Map((users ?? []).map((user) => [user.id, user.display_name]));
  const winnerNames = new Map((winners ?? []).map((row) => [row.id, names.get(row.user_id) ?? null]));
  const published = new Map((rawFinished ?? []).map((row) => [row.id, row.published_paths.length > 0]));

  return {
    weeks: Array.from({ length: PLANNING_WEEKS }, (_, index) => addWeeks(nextWeek, index)),
    scheduled: scheduled.filter((contest) => contest.weekStart >= nextWeek).reverse(),
    submission: submission
      ? {
          ...submission,
          entries: (entryRows ?? []).map((row) => ({
            id: row.id,
            status: row.status,
            username: names.get(row.user_id) ?? null,
            thumbUrl: row.thumb_path
              ? supabase.storage.from(CONTEST_BUCKET).getPublicUrl(row.thumb_path).data.publicUrl
              : null,
          })),
        }
      : null,
    finished: finished.map((contest) => ({
      ...contest,
      winnerName: contest.winnerEntryId ? (winnerNames.get(contest.winnerEntryId) ?? null) : null,
      published: published.get(contest.id) ?? false,
    })),
    animals: (animals ?? []).map((animal) => ({ id: animal.id, name: animal.common_name })),
  };
}
