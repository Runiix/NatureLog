"use server"

import { createClient } from "@/utils/supabase/server";

export default async function getAnimalLists(userId: string) {
  const supabase = await createClient();
 const { data: lists, error: listsError } = await supabase.from("animallists").select("*").eq("user_id", userId);
 return { lists, error: listsError };
}