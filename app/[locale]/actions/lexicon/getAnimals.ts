"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/app/[locale]/utils/data";
import { escapeLike } from "@/app/[locale]/utils/escapeLike";
import {
  ALL_ORDERS,
  COLOR_VALUES,
  ENDANGERMENT,
  GENERA,
  SIZE_MAX,
  SIZE_MIN,
  SORT_COLUMNS,
  pickAllowed,
  type SortColumn,
} from "@/app/[locale]/utils/lexiconFilters";

const MAX_PAGE_SIZE = 50;

const toSize = (raw: string | null) => {
  if (raw === null || raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= SIZE_MIN && value <= SIZE_MAX ? value : null;
};

/**
 * One page of the lexicon for the given URL filters.
 *
 * Every filter value is checked against lexiconFilters before it reaches the
 * query. The seen/unseen filters use the caller's spotted ids read here on the
 * server — they used to come from the client, and an empty list produced a
 * malformed `not in ()` filter.
 */
export default async function getAnimals(
  searchParams: Record<string, string>,
  offset: number,
  pageSize: number,
) {
  const params = new URLSearchParams(searchParams);
  const supabase = await createClient();

  const genus = pickAllowed(params.get("genus"), GENERA);
  const order = pickAllowed(params.get("order"), ALL_ORDERS);
  const endangerment = pickAllowed(params.get("endangerment"), ENDANGERMENT);
  const colors = pickAllowed(params.get("color"), COLOR_VALUES);
  const sizeFrom = toSize(params.get("sizeFrom"));
  const sizeTo = toSize(params.get("sizeTo"));
  const search = (params.get("query") ?? "").trim().slice(0, 100);
  const sortParam = params.get("sortBy");
  const sortBy: SortColumn = (SORT_COLUMNS as readonly string[]).includes(sortParam ?? "")
    ? (sortParam as SortColumn)
    : "common_name";
  const ascending = params.get("sortOrder") !== "descending";
  const onlySeen = params.get("onlySeen") === "true";
  const onlyUnseen = params.get("onlyUnseen") === "true";
  const excludeRares = params.get("excludeRares") === "true";

  const size = Math.min(Math.max(1, Math.trunc(pageSize)), MAX_PAGE_SIZE);
  const from = Math.max(0, Math.trunc(offset)) * size;
  const to = from + size - 1;

  let query = supabase.from("animals").select("*");

  if (genus.length > 0) query = query.in("category", genus);
  if (order.length > 0) query = query.in("taxonomic_order", order);
  if (endangerment.length > 0) query = query.in("endangerment_status", endangerment);
  if (colors.length > 0) {
    // Safe to interpolate: every value is from the fixed COLORS list.
    query = query.or(colors.map((color) => `colors.ilike.%${color}%`).join(","));
  }
  if (excludeRares) query = query.neq("very_rare", true);
  if (sizeFrom !== null) query = query.gt("size_from", sizeFrom);
  if (sizeTo !== null) query = query.lt("size_to", sizeTo);
  if (search) query = query.ilike("common_name", `%${escapeLike(search)}%`);

  if (onlySeen || onlyUnseen) {
    const user = await getUser(supabase);
    if (user) {
      const { data } = await supabase.from("spotted").select("animal_id").eq("user_id", user.id);
      const ids = (data ?? [])
        .map((row) => row.animal_id)
        .filter((id): id is number => id !== null);
      if (onlySeen) {
        if (ids.length === 0) return [];
        query = query.in("id", ids);
      } else if (ids.length > 0) {
        query = query.not("id", "in", `(${ids.join(",")})`);
      }
    }
  }

  const sortColumn = sortBy === "endangerment_status" ? "endangerment_order" : sortBy;
  query = query.order(sortColumn, { ascending });
  if (sortColumn !== "common_name") query = query.order("id", { ascending });

  const { data, error } = await query.range(from, to);
  if (error) {
    console.error("Failed to fetch animals", error);
    return [];
  }
  return data;
}
