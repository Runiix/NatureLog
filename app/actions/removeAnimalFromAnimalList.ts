"use server";

import { createClient } from "@/utils/supabase/server";

export default async function removeAnimalFromAnimalList(
  listId: string,
  animalId: number,
  userId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("animallistitems")
    .delete()
    .match({ list_id: listId, animal_id: animalId, user_id: userId });
  if (error) {
    console.error("Error deleting animal into list");
    return { success: false };
  }
  return { success: true };
}
