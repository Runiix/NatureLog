"use server";

import { createClient } from "@/utils/supabase/server";

export default async function getCount(listId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("animallistitems")
    .select("id")
    .eq("list_id", listId);
  if (error) {
    console.error("Error getting count", error);
    return 0;
  }
  return data.length;
}
