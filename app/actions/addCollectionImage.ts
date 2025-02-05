"use server";

import { createClient } from "@/utils/supabase/server";

export default async function addCollectionImage(formData: FormData) {
  const supabase = await createClient();
  const regex = /[äöüß]/g;
  const common_name = formData.get("common_name") as string;
  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, message: "No file uploaded" };
  }
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated for Photo upload!");
    }
    const filePath = `/${user.id}/Collection/${
      common_name.replace(regex, "_") + ".jpg"
    }`;

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
  }
}
