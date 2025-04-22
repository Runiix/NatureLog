"use server";

import { createClient } from "@/utils/supabase/server";

export default async function changeInstaLink(formData: FormData) {
  const supabase = await createClient();
  const link = formData.get("link") as string;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated for Value change");
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ insta_link: link })
    .eq("user_id", user.id);
  if (updateError) return { success: false };

  return { success: true };
}
