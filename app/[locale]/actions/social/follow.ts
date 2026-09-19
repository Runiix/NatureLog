"use server";

import { revalidatePath } from "next/cache";
import requireAuth from "@/utils/supabase/requireAuth";
import { fail, ok } from "@/app/[locale]/utils/result";

/**
 * Follows a user. Idempotent (a second call does not add a second row) and
 * refuses self-follows. Profile visibility depends on mutual follows, so the
 * profile and collection pages are revalidated.
 */
export default async function follow(followingId: string) {
  const { supabase, user } = await requireAuth();
  if (typeof followingId !== "string" || followingId.length === 0) return fail("Invalid user");
  if (followingId === user.id) return fail("You cannot follow yourself");

  const { data: existing, error: readError } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", followingId)
    .limit(1);
  if (readError) {
    console.error("Error reading follow", readError);
    return fail(readError.message);
  }

  if (existing.length === 0) {
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: user.id, following_id: followingId });
    if (error) {
      console.error("Error following", error);
      return fail(error.message);
    }
  }

  revalidatePath("/[locale]/profilepage/[username]", "page");
  revalidatePath("/[locale]/collectionpage/[username]", "page");
  return ok();
}
