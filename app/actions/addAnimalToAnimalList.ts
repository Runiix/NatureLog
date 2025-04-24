"use server";

import { createClient } from "@/utils/supabase/server";

export default async function addAnimalToAnimalList(
  listId: string,
  animalId: number,
  userId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("animallistitems")
    .insert({ animal_id: animalId, list_id: listId, user_id: userId });
  if (error) {
    console.error("Error inserting animal into list");
    return { success: false };
  }
  return { success: true };
}
