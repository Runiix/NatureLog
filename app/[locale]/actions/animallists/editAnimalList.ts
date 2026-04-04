"use server";

import { createClient } from "@/utils/supabase/server";

export default async function editAnimalList(
  title: string,
  listId: string,
  description: string,
  publicList: boolean
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("animallists")
    .update({
      title: title,
      description: description,
      is_public: publicList,
    })
    .eq("id", listId);
  if (error) {
    console.error("Error editing animal list", error);
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}
