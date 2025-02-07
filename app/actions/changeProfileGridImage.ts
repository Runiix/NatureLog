"use server";

import { createClient } from "@/utils/supabase/server";

export default async function changeProfileGridImage(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  const old_file = formData.get("old_file") as string;
  const fileName = formData.get("fileName") as string;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("CHANGING", file, old_file);
    if (!user) {
      throw new Error("User not authenticated for Photo upload!");
    }
    const filePath = `/${user.id}/ProfileGrid/${fileName}`;

    const { error: removeError } = await supabase.storage
      .from("profiles")
      .remove([old_file]);
    if (removeError) {
      console.error(removeError);
    }
    const { error: insertError } = await supabase.storage
      .from("profiles")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });
    if (insertError) {
      console.error(insertError);
    }
    return { success: true };
  } catch (error) {
    console.error("Error uploading file: ", error);
    return { success: false };
  }
}
