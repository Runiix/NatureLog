"use server";

import { revalidatePath } from "next/cache";
import requireAuth from "@/utils/supabase/requireAuth";
import { fail, ok } from "@/app/[locale]/utils/result";

export default async function unfollow(followingId: string) {
  const { supabase, user } = await requireAuth();
  if (typeof followingId !== "string" || followingId.length === 0) return fail("Invalid user");

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", followingId);
  if (error) {
    console.error("Error unfollowing", error);
    return fail(error.message);
  }

  revalidatePath("/[locale]/profilepage/[username]", "page");
  revalidatePath("/[locale]/collectionpage/[username]", "page");
  return ok();
}
