"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { revalidateListPages } from "@/app/[locale]/utils/listAccess";

export default async function addAnimalToAnimalList(
  listId: string,
  animalId: number,
) {
  const { supabase, user } = await requireAuth();

  const { data: list, error: listError } = await supabase
    .from("animallists")
    .select("id")
    .eq("id", listId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (listError || !list) {
    console.error("Error inserting animal into list", listError);
    return { success: false };
  }

  // Adding an animal that is already on the list is a no-op, not a second row.
  const { data: existing } = await supabase
    .from("animallistitems")
    .select("id")
    .match({ list_id: listId, animal_id: animalId })
    .limit(1);
  if (existing && existing.length > 0) return { success: true };

  const { error } = await supabase
    .from("animallistitems")
    .insert({ animal_id: animalId, list_id: listId, user_id: user.id });
  if (error) {
    console.error("Error inserting animal into list", error);
    return { success: false };
  }
  revalidateListPages();
  return { success: true };
}
