"use server";

import { createClient } from "@/utils/supabase/server";

export default async function removeProfileGridImage(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as string;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated for Photo upload!");
    }
    const { error: insertError } = await supabase.storage
      .from("profiles")
      .remove([file]);
    if (insertError) {
      console.error(insertError);
    }
    return { success: true, profileGridFull: false };
  } catch (error) {
    console.error("Error uploading file: ", error);
    return { success: false, profileGridFull: false };
  }
}
