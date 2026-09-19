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

const PAGE_SIZE = 1000;

/**
 * Reads every row of a query page by page. PostgREST caps a response at 1000
 * rows, so a plain select over all items of many lists came back silently
 * truncated. `page` must apply a stable order before `.range(from, to)`.
 */
export async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
  label: string,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) {
      console.error(`Error getting ${label}`, error);
      break;
    }
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

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

  const [upvotes, items] = await Promise.all([
    fetchAllRows(
      (from, to) =>
        supabase.from("listupvotes").select("id, list_id").in("list_id", listIds).order("id").range(from, to),
      "Upvotes",
    ),
    fetchAllRows(
      (from, to) =>
        supabase.from("animallistitems").select("id, list_id").in("list_id", listIds).order("id").range(from, to),
      "list entry counts",
    ),
  ]);

  return {
    upvotes: tally(upvotes),
    entryCounts: tally(items),
  };
}

/** Distinct animal ids per list, keyed by list id. */
export async function getListAnimalIds(
  supabase: TypedSupabaseClient,
  listIds: string[],
): Promise<Record<string, number[]>> {
  if (listIds.length === 0) return {};

  const items = await fetchAllRows(
    (from, to) =>
      supabase
        .from("animallistitems")
        .select("id, list_id, animal_id")
        .in("list_id", listIds)
        .order("id")
        .range(from, to),
    "list animals",
  );

  const byList: Record<string, Set<number>> = {};
  for (const item of items) {
    if (item.list_id === null || item.animal_id === null) continue;
    (byList[item.list_id] ??= new Set()).add(item.animal_id);
  }
  return Object.fromEntries(Object.entries(byList).map(([id, set]) => [id, [...set]]));
}
