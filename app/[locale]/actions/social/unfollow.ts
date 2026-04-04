"use server";

import { createClient } from "@/utils/supabase/server";

export default async function unfollow(
  followerId: string,
  followingId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);

  if (error) console.error("Error unfollowing", error);
}
