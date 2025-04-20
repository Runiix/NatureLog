"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export default async function getAnimals(
  searchParams: Record<string, string>,
  offset: number,
  pageSize: number
) {
  const params = new URLSearchParams(searchParams as Record<string, string>);
  const supabase = await createClient();
  const color = params.get("color")?.split(",") || [];
  const sizeFrom = params.get("sizeFrom") || null;
  const sizeTo = params.get("sizeTo") || null;
  const genus = params.get("genus")?.split(",") || [];
  const search = params.get("query") || "";
  const sortBy = params.get("sortBy") || null;
  const endangerment = params.get("endangerment")?.split(",") || [];
  const sortOrder = params.get("sortOrder") || null;
  let bool = false;
  if (sortOrder === "ascending" || sortOrder === null) {
    bool = true;
  }
  const from = offset * pageSize;
  const to = (offset + 1) * pageSize - 1;

  let query = supabase.from("animals").select("*");

  if (genus.length > 0) {
    query = query.in("category", genus);
  }
  if (endangerment.length > 0) {
    query = query.in("endangerment_status", endangerment);
  }
  if (color.length > 0) {
    const colorConditions = color
      .map((color) => `colors.ilike.%${color}%`)
      .join(",");

    query = query.or(colorConditions);
  }
  if (sizeFrom) {
    query = query.gt("size_from", sizeFrom);
  }
  if (sizeTo) {
    query = query.lt("size_to", sizeTo);
  }
  if (sortBy) {
    if (sortBy === "endangerment_status") {
      query = query
        .order("endangerment_order", { ascending: bool })
        .order("id", { ascending: bool });
    } else {
      query = query
        .order(sortBy, { ascending: bool })
        .order("id", { ascending: bool });
    }
  } else {
    query = query.order("common_name", { ascending: bool });
  }
  if (search !== "") {
    query = query.ilike("common_name", `%${search}%`);
  }
  query = query.range(from, to);

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch data", error);
    return [];
  }
  revalidatePath;
  return data;
}
