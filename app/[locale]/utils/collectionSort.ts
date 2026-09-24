/** Columns the collection can be sorted by; anything else in the URL is ignored. */
export const COLLECTION_SORT_COLUMNS = ["common_name", "first_spotted_at"] as const;

export type CollectionSortColumn = (typeof COLLECTION_SORT_COLUMNS)[number];

/** Reads `?sortBy=` and `?sortOrder=` against the whitelist; default is name, A–Z. */
export function parseCollectionSort(params: URLSearchParams): {
  column: CollectionSortColumn;
  ascending: boolean;
} {
  const raw = params.get("sortBy");
  const column = (COLLECTION_SORT_COLUMNS as readonly string[]).includes(raw ?? "")
    ? (raw as CollectionSortColumn)
    : "common_name";
  return { column, ascending: params.get("sortOrder") !== "descending" };
}
