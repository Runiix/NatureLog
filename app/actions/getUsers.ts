"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export default async function getUsers(
  searchParams: Record<string, string>,
  userId: string
) {
  const params = new URLSearchParams(searchParams as Record<string, string>);
  const supabase = await createClient();

  const search = params.get("query") || "";
  const following = params.get("following") || "";
  if (following === "all") {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .neq("id", userId)
      .ilike("display_name", `%${search}%`);

    if (error) {
      console.error(error);
      return [];
    }
    return data;
  }
  if (following === "") {
    const { data, error } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);
    if (error) throw error;
    const following = data.map((f) => f.following_id);
    let query = supabase.from("users").select("*").in("id", following);
    if (search !== "") {
      query = query.ilike("display_name", `%${search}%`);
    }
    const { data: users, error: error2 } = await query;
    if (error2) throw error2;
    revalidatePath;
    if (users.length === 0) {
      return [];
    }
    return users;
  }
  if (following === "followers") {
    const { data, error } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("following_id", userId);
    if (error) throw error;
    const followers = data.map((f) => f.follower_id);
    let query = supabase.from("users").select("*").in("id", followers);
    if (search !== "") {
      query = query.ilike("display_name", `%${search}%`);
    }
    const { data: users, error: error2 } = await query;
    if (error2) throw error2;
    revalidatePath;
    if (users.length === 0) {
      return [];
    }
    return users;
  }
  return [];
}
