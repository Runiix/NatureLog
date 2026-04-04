"use server";

import { createClient } from "@/utils/supabase/server";

export default async function removeProfileGridImage(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as string;
  const modalFile = formData.get("modalFile") as string;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated for Photo delete!");
    }
    const { error: insertError1 } = await supabase.storage
      .from("profiles")
      .remove([file]);
    if (insertError1) {
      console.error(insertError1);
    }
    const { error: insertError2 } = await supabase.storage
      .from("profiles")
      .remove([modalFile]);
    if (insertError2) {
      console.error(insertError2);
    }

    return { success: true, profileGridFull: false };
  } catch (error) {
    console.error("Error uploading file: ", error);
    return { success: false, profileGridFull: false };
  }
}
