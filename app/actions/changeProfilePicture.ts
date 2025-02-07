"use server";

import { createClient } from "@/utils/supabase/server";

export default async function changeProfilePicture(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  console.log("UPDATING PORFILE PIC");

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated for Photo upload!");
    }
    const filePath = `/${user.id}/ProfilePicture/ProfilePic.jpg`;

    const { error: insertError } = await supabase.storage
      .from("profiles")
      .update(filePath, file, {
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
