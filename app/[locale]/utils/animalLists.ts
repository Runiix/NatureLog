import type { TypedSupabaseClient } from "@/utils/supabase/types";

export type ListStats = {
  upvotes: Record<string, number>;
  entryCounts: Record<string, number>;
};

const tally = (rows: { list_id: string | null }[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    if (row.list_id === null) continue;
    counts[row.list_id] = (counts[row.list_id] ?? 0) + 1;
  }
  return counts;
};

/**
 * Upvote and entry counts for a set of animal lists, keyed by list id.
 *
 * Both the profile page and the lists map used to inline this same pair of
 * queries plus the tally loop, once per branch.
 */
export async function getListStats(
  supabase: TypedSupabaseClient,
  listIds: string[],
): Promise<ListStats> {
  if (listIds.length === 0) return { upvotes: {}, entryCounts: {} };

  const [{ data: upvotes, error: upvoteError }, { data: items, error: itemError }] =
    await Promise.all([
      supabase.from("listupvotes").select("id, list_id").in("list_id", listIds),
      supabase.from("animallistitems").select("id, list_id").in("list_id", listIds),
    ]);

  if (upvoteError) console.error("Error getting Upvotes", upvoteError);
  if (itemError) console.error("Error getting list entry counts", itemError);

  return {
    upvotes: tally(upvotes ?? []),
    entryCounts: tally(items ?? []),
  };
}
