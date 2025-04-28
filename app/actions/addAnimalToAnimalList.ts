"use server";

import { createClient } from "@/utils/supabase/server";

export default async function addAnimalToAnimalList(
  listId: string,
  animalId: number,
  userId: string,
  entryCount: number
) {
  const supabase = await createClient();
  console.log("DURING ADD", entryCount);

  const { error } = await supabase
    .from("animallistitems")
    .insert({ animal_id: animalId, list_id: listId, user_id: userId });
  if (error) {
    console.error("Error inserting animal into list");
    return { success: false };
  }
  const { error: countError } = await supabase
    .from("animallists")
    .update({ entry_count: entryCount + 1 })
    .eq("id", listId);
  if (countError) {
    console.error("Error updating Entry count");
    return { success: false };
  }
  return { success: true };
}
