"use server";

import { createClient } from "@/utils/supabase/server";

export default async function getAnimalListSearchItems(query: string | null) {
  const supabase = await createClient();
  if (query === null) {
    const { data, error } = await supabase
      .from("animals")
      .select("id, common_name, lexicon_link")
      .order("common_name", { ascending: true });
    if (error) {
      console.error("Error fetching animal list search items", error);
      return [];
    }
    return data;
  } else {
    const { data, error } = await supabase
      .from("animals")
      .select("id, common_name, lexicon_link")
      .ilike("common_name", `%${query}%`)
      .order("common_name", { ascending: true });

    if (error) {
      console.error("Error fetching animal list search items", error);
      return [];
    }
    return data;
  }
}
