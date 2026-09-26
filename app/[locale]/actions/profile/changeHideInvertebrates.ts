"use server";

import { revalidatePath } from "next/cache";
import requireAuth from "@/utils/supabase/requireAuth";

/** Flips whether the lexicon and daily challenge leave out invertebrates by default. */
export default async function changeHideInvertebrates() {
  const { supabase, user } = await requireAuth();

  const { data, error: readError } = await supabase
    .from("profiles")
    .select("hide_invertebrates")
    .eq("user_id", user.id)
    .single();
  if (readError || !data) {
    console.error("Error reading invertebrate setting", readError);
    return { success: false, error: "Profile not found" };
  }

  const hideInvertebrates = !data.hide_invertebrates;
  const { error } = await supabase
    .from("profiles")
    .update({ hide_invertebrates: hideInvertebrates })
    .eq("user_id", user.id);
  if (error) {
    console.error("Error changing invertebrate setting", error);
    return { success: false, error: "failed" };
  }

  revalidatePath("/[locale]/settingspage", "page");
  revalidatePath("/[locale]/lexiconpage", "layout");
  revalidatePath("/[locale]/homepage", "page");
  return { success: true, hideInvertebrates };
}
