"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export default async function getUsers(searchParams: Record<string, string>) {
  const params = new URLSearchParams(searchParams as Record<string, string>);
  const supabase = await createClient();

  const search = params.get("query") || "";
  if (search === "") {
    return [];
  }
  let query = supabase.from("users").select("*");

  if (search !== "") {
    query = query.ilike("display_name", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch users", error);
    return [];
  }
  revalidatePath;
  return data;
}
