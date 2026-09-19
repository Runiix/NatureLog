"use server";

import { revalidatePath } from "next/cache";
import requireAuth from "@/utils/supabase/requireAuth";
import { fail, ok } from "@/app/[locale]/utils/result";

/**
 * Deletes the caller's profile picture. The flag is cleared first so the
 * avatar disappears everywhere even if removing the object fails.
 */
export default async function removeProfilePicture() {
  const { supabase, user } = await requireAuth();

  const { error } = await supabase
    .from("profiles")
    .update({ profile_picture: false })
    .eq("user_id", user.id);
  if (error) {
    console.error("Error clearing profile picture", error);
    return fail(error.message);
  }

  const { error: removeError } = await supabase.storage
    .from("profiles")
    .remove([`${user.id}/ProfilePicture/ProfilePic.jpg`]);
  if (removeError) console.error("Error removing profile picture", removeError);

  revalidatePath("/[locale]/profilepage/[username]", "page");
  return ok();
}
