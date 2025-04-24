"use server";

import { createClient } from "@/utils/supabase/server";

export default async function deleteAnimalList(listId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("animallists")
    .delete()
    .eq("id", listId);
  if (error) {
    console.error("Error deleting animal list", error);
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}
