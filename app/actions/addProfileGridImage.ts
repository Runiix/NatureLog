"use server";

import { createClient } from "@/utils/supabase/server";

export default async function addProfileGridImage(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated for Photo upload!");
    }
    const filePath = `/${user.id}/ProfileGrid/${file.name}`;

    const { data: listData, error: listError } = await supabase.storage
      .from("profiles")
      .list(user?.id + "/ProfileGrid/", {
        limit: 13,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });
    if (listError) {
      console.error(listError);
    }

    if (listData === null || listData.length < 13) {
      const { error: insertError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });
      if (insertError) {
        console.error(insertError);
      }
    } else {
      return { success: false, profileGridFull: true };
    }
    return { success: true, profileGridFull: false };
  } catch (error) {
    console.error("Error uploading file: ", error);
    return { success: false, profileGridFull: false };
  }
}
