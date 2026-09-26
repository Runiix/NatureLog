"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { canReadList } from "@/app/[locale]/utils/listAccess";
import { pageRange } from "@/app/[locale]/utils/pageRange";

/** One page of a list's animals, alphabetical. */
export default async function getAnimalListItems(
  listId: string,
  offset: number,
  pageSize: number,
) {
  const { supabase, user } = await requireAuth();
  if (!(await canReadList(supabase, user.id, listId))) return [];

  const { from, to } = pageRange(offset, pageSize);

  const { data: items, error: itemsError } = await supabase
    .from("animallistitems")
    .select("animal_id")
    .eq("list_id", listId);
  if (itemsError) {
    console.error("Error fetching animal ids", itemsError);
    return [];
  }

  const animalIds = items
    .map((item) => item.animal_id)
    .filter((id): id is number => id !== null);
  if (animalIds.length === 0) return [];

  const { data, error } = await supabase
    .from("animals")
    .select("id, common_name, lexicon_link")
    .in("id", animalIds)
    .order("common_name", { ascending: true })
    .range(from, to);
  if (error) {
    console.error("Error fetching animal data", error);
    return [];
  }
  return data;
}
