"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { escapeLike } from "@/app/[locale]/utils/escapeLike";

const MAX_RESULTS = 50;

/**
 * Animals matching a name search, for the "add to list" picker. Capped: with
 * an empty query it used to return the entire animals table on every open.
 */
export default async function getAnimalListSearchItems(query: string | null) {
  const { supabase } = await requireAuth();

  let request = supabase
    .from("animals")
    .select("id, common_name, lexicon_link")
    .order("common_name", { ascending: true })
    .limit(MAX_RESULTS);

  const term = query?.trim();
  if (term) request = request.ilike("common_name", `%${escapeLike(term)}%`);

  const { data, error } = await request;
  if (error) {
    console.error("Error fetching animal list search items", error);
    return [];
  }
  return data;
}
