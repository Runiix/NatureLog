"use server";

import { createClient } from "@/utils/supabase/server";

export default async function changeProfileGridImage(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  const old_file = formData.get("old_file") as string;
  console.log("NEW FILE", file.name, "OLD FILE", old_file);
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log(file, old_file);
    if (!user) {
      throw new Error("User not authenticated for Photo upload!");
    }
    const filePath = `/${user.id}/ProfileGrid/${file.name}`;

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
