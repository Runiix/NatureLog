"use server";

import { createClient } from "@/utils/supabase/server";

export default async function changeProfileGridImage(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  const modalFile = formData.get("modalFile") as File;
  const old_file = formData.get("old_file") as string;
  const old_modalFile = formData.get("old_modalFile") as string;
  const fileName = formData.get("fileName") as string;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated for Photo upload!");
    }
    const filePath = `/${user.id}/ProfileGrid/${fileName}`;
    const modalPath = `/${user.id}/ProfileGridModals/${fileName}`;

    const { error: removeError1 } = await supabase.storage
      .from("profiles")
      .remove([old_file]);
    if (removeError1) {
      console.error(removeError1);
    }
    const { error: insertError1 } = await supabase.storage
      .from("profiles")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });
    if (insertError1) {
      console.error(insertError1);
    }
    const { error: removeError2 } = await supabase.storage
      .from("profiles")
      .remove([old_modalFile]);
    if (removeError2) {
      console.error(removeError2);
    }
    const { error: insertError2 } = await supabase.storage
      .from("profiles")
      .upload(modalPath, modalFile, {
        cacheControl: "3600",
        upsert: true,
      });
    if (insertError2) {
      console.error(insertError2);
    }
    return { success: true };
  } catch (error) {
    console.error("Error uploading file: ", error);
    return { success: false };
  }
}
