"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/app/[locale]/utils/data";
import { escapeLike } from "@/app/[locale]/utils/escapeLike";

export type SearchResults = {
  animals: { name: string; scientificName: string }[];
  users: { name: string }[];
  lists: { id: string; title: string; ownerName: string }[];
};

const EMPTY: SearchResults = { animals: [], users: [], lists: [] };
const PER_GROUP = 5;
// Keep in sync with MIN_LENGTH in GlobalSearch ("use server" files may only export async functions).
const MIN_SEARCH_LENGTH = 2;

/**
 * The nav's search: species for everyone, people and public lists only for
 * signed-in users (the community pages behind them are protected anyway).
 * Lists are restricted to public ones, or the caller's own, in the query
 * itself — the result never carries a private list of someone else.
 */
export default async function globalSearch(input: string): Promise<SearchResults> {
  const term = input.trim().slice(0, 50);
  if (term.length < MIN_SEARCH_LENGTH) return EMPTY;
  const pattern = `%${escapeLike(term)}%`;

  const supabase = await createClient();
  const viewer = await getUser(supabase);

  const animalsQuery = supabase
    .from("animals")
    .select("common_name, scientific_name")
    .or(`common_name.ilike.${quoteFilter(pattern)},scientific_name.ilike.${quoteFilter(pattern)}`)
    .order("common_name")
    .limit(PER_GROUP);

  if (!viewer) {
    const { data, error } = await animalsQuery;
    if (error) console.error("Error searching animals", error);
    return { ...EMPTY, animals: toAnimals(data) };
  }

  const [animals, users, lists] = await Promise.all([
    animalsQuery,
    supabase
      .from("users")
      .select("display_name")
      .ilike("display_name", pattern)
      .order("display_name")
      .limit(PER_GROUP),
    supabase
      .from("animallists")
      .select("id, title, user_id")
      .or(`is_public.eq.true,user_id.eq.${viewer.id}`)
      .ilike("title", pattern)
      .order("created_at", { ascending: false })
      .limit(PER_GROUP),
  ]);
  for (const { error } of [animals, users, lists]) {
    if (error) console.error("Error in global search", error);
  }

  // Lists link to their owner's lists page, so resolve owner names.
  const ownerIds = [...new Set((lists.data ?? []).map((l) => l.user_id).filter((id): id is string => !!id))];
  const owners = new Map<string, string>();
  if (ownerIds.length > 0) {
    const { data, error } = await supabase.from("users").select("id, display_name").in("id", ownerIds);
    if (error) console.error("Error resolving list owners", error);
    for (const row of data ?? []) owners.set(row.id, row.display_name);
  }

  return {
    animals: toAnimals(animals.data),
    users: (users.data ?? []).map((row) => ({ name: row.display_name })),
    lists: (lists.data ?? []).flatMap((row) => {
      const ownerName = row.user_id ? owners.get(row.user_id) : undefined;
      return ownerName && row.title ? [{ id: row.id, title: row.title, ownerName }] : [];
    }),
  };
}

function toAnimals(rows: { common_name: string; scientific_name: string }[] | null) {
  return (rows ?? []).map((row) => ({ name: row.common_name, scientificName: row.scientific_name }));
}

/**
 * Double-quotes a value for a PostgREST `.or()` list, so commas, dots or
 * parentheses typed by the user stay part of the value instead of starting a
 * new condition.
 */
function quoteFilter(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
