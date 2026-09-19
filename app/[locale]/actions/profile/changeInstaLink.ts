"use server";

import { revalidatePath } from "next/cache";
import requireAuth from "@/utils/supabase/requireAuth";
import { validateInstagramLink } from "@/app/[locale]/utils/profileFields";
import { fail, ok } from "@/app/[locale]/utils/result";

export default async function changeInstaLink(formData: FormData) {
  const { supabase, user } = await requireAuth();

  const link = validateInstagramLink(formData.get("link"));
  if (!link.success) return link;

  const { error } = await supabase
    .from("profiles")
    .update({ insta_link: link.data })
    .eq("user_id", user.id);
  if (error) {
    console.error("Error changing Instagram link", error);
    return fail<string | null>(error.message);
  }

  revalidatePath("/[locale]/profilepage/[username]", "page");
  return ok(link.data);
}
