"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export default async function getCollectionAnimals(
  spottedList: number[],
  offset: number,
  pageSize: number,
  query: string,
  genus: string
) {
  const supabase = await createClient();

  const from = offset * pageSize;
  const to = (offset + 1) * pageSize - 1;

  if (genus === "all") {
    const { data, error } = await supabase
      .from("animals")
      .select("*")
      .in("id", spottedList)
      .order("common_name", { ascending: true })
      .ilike("common_name", `%${query}%`)
      .range(from, to);
    if (error) {
      throw new Error("Failed to fetch data");
    }
    revalidatePath;
    return data;
  } else {
    const { data, error } = await supabase
      .from("animals")
      .select("*")
      .in("id", spottedList)
      .eq("category", genus)
      .order("common_name", { ascending: true })
      .ilike("common_name", `%${query}%`)
      .range(from, to);
    if (error) {
      throw new Error("Failed to fetch data");
    }
    revalidatePath;
    return data;
  }
}
