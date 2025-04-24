"use server";

import { createClient } from "@/utils/supabase/server";

export default async function getAnimalListSearchItems(query: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("animals")
    .select("id, common_name, lexicon_link")
    .ilike("common_name", `%${query}%`)
    .limit(10);

  if (error) {
    console.error("Error fetching animal list search items", error);
    return [];
  }
  return data;
}
