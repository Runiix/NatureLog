"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { revalidateListPages } from "@/app/[locale]/utils/listAccess";

export default async function removeAnimalFromAnimalList(
  listId: string,
  animalId: number,
) {
  const { supabase, user } = await requireAuth();

  const { error } = await supabase
    .from("animallistitems")
    .delete()
    .match({ list_id: listId, animal_id: animalId, user_id: user.id });
  if (error) {
    console.error("Error deleting animal from list", error);
    return { success: false };
  }
  revalidateListPages();
  return { success: true };
}
