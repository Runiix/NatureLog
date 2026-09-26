"use server";

import { revalidatePath } from "next/cache";
import requireAuth from "@/utils/supabase/requireAuth";

/**
 * Toggles the caller's own profile visibility. Takes no parameters: the user is
 * derived from the session and the current value is read server-side, so a
 * caller can neither target another profile nor dictate the resulting state.
 */
export default async function changePublicProfile() {
  const { supabase, user } = await requireAuth();

  const { data, error: readError } = await supabase
    .from("profiles")
    .select("is_public")
    .eq("user_id", user.id)
    .single();

  if (readError || !data) {
    console.error("Error reading profile status", readError);
    return { success: false, error: "Profile not found" };
  }

  const isPublic = !data.is_public;

  const { error } = await supabase
    .from("profiles")
    .update({ is_public: isPublic })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error changing profile status", error);
    return { success: false, error: "failed" };
  }

  revalidatePath("/settingspage");
  return { success: true, isPublic };
}
