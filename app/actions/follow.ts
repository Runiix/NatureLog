"use server";

import { createClient } from "@/utils/supabase/server";

export default async function follow(followerId: string, followingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("follows")
    .insert([{ follower_id: followerId, following_id: followingId }]);

  if (error) console.error("Error following", error);
  return data;
}
