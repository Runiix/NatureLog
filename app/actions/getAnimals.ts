"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export default async function getAnimals(
  { filters }: any,
  offset: number,
  pageSize: number,
  query: string
) {
  const supabase = await createClient();

  const from = offset * pageSize;
  const to = (offset + 1) * pageSize - 1;

  if (filters[0] === "all" && filters[1] === "all") {
    console.log(1);
    const { data, error } = await supabase
      .from("animals")
      .select("*")
      .gte("size_from", filters[2])
      .lte("size_from", filters[3])
      .order(filters[4], { ascending: JSON.parse(filters[5]) })
      .ilike("common_name", `%${query}%`)
      .range(from, to);
    if (error) {
      throw new Error("Failed to fetch data");
    }
    revalidatePath;
    return data;
  } else if (filters[0] === "all") {
    console.log(2);
    const { data, error } = await supabase
      .from("animals")
      .select("*")
      .textSearch("colors", `${filters[1]}`, {
        config: "english",
      })
      .gte("size_from", filters[2])
      .lte("size_from", filters[3])
      .order(filters[4], { ascending: JSON.parse(filters[5]) })

      .ilike("common_name", `%${query}%`)
      .range(from, to);
    if (error) {
      throw new Error("Failed to fetch data");
    }
    revalidatePath;
    return data;
  } else if (filters[1] === "all") {
    console.log(3);
    const { data, error } = await supabase
      .from("animals")
      .select("*")
      .eq("category", decodeURIComponent(filters[0]))
      .gte("size_from", filters[2])
      .lte("size_from", filters[3])
      .order(filters[4], { ascending: JSON.parse(filters[5]) })
      .ilike("common_name", `%${query}%`)
      .range(from, to);
    if (error) {
      throw new Error("Failed to fetch data");
    }
    revalidatePath;
    return data;
  } else {
    console.log(4);

    const { data, error } = await supabase
      .from("animals")
      .select("*")
      .match({
        category: decodeURIComponent(filters[0]),
      })
      .textSearch("colors", `${filters[1]}`, {
        config: "english",
      })
      .gte("size_from", filters[2])
      .lte("size_from", filters[3])
      .order(filters[4], { ascending: JSON.parse(filters[5]) })
      .ilike("common_name", `%${query}%`)
      .range(from, to);
    if (error) {
      throw new Error("Failed to fetch data");
    }
    revalidatePath;
    return data;
  }
}
