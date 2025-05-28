"use server";

import { createClient } from "@/utils/supabase/server";

export default async function changeProfilePicture(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  const exists = formData.get("exists") as string;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated for Photo upload!");
    }
    const filePath = `/${user.id}/ProfilePicture/ProfilePic.jpg`;
    if (exists === "true") {
      const { error: updateError } = await supabase.storage
        .from("profiles")
        .update(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });
      if (updateError) {
        console.error(updateError);
      }
    } else {
      const { error: insertError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });
      if (insertError) {
        console.error(insertError);
      }
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ profile_picture: true })
        .eq("user_id", user.id);
      if (profileError) {
        console.error(profileError);
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Error uploading file: ", error);
    return { success: false };
  }
}
