"use server";

import { createClient } from "@/utils/supabase/server";

export default async function removeAnimalFromAnimalList(
  listId: string,
  animalId: number,
  userId: string,
  entryCount: number
) {
  const supabase = await createClient();
  console.log("DURING REMOVE", entryCount);

  const { error } = await supabase
    .from("animallistitems")
    .delete()
    .match({ list_id: listId, animal_id: animalId, user_id: userId });
  if (error) {
    console.error("Error deleting animal from list");
    return { success: false };
  }
  const { error: countError } = await supabase
    .from("animallists")
    .update({ entry_count: entryCount - 1 })
    .eq("id", listId);
  if (countError) {
    console.error("Error updating Entry count");
    return { success: false };
  }
  return { success: true };
}
