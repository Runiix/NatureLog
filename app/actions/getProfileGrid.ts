"use server";

import { createClient } from "@/utils/supabase/server";

export default async function getProfileGrid() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User is not authenticated!" };
  }
  const { data, error } = await supabase.storage
    .from("profiles")
    .list(user.id + "/ProfileGrid/", {
      limit: 11,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });
  if (error) console.error("Error fetching profile grid", error);
  if (data === null) return [];
  data.shift();
  return data;
}
