"use server";

import { createClient } from "@/utils/supabase/server";

export default async function addCollectionImage(formData: FormData) {
  const supabase = await createClient();
  const regex = /[äöüß ]/g;
  const common_name = formData.get("common_name") as string;
  const file = formData.get("file") as File | null;
  const id = formData.get("id");
  if (!file) {
    return { success: false, message: "No file uploaded" };
  }
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log(user?.id, id);

    if (!user) {
      throw new Error("User not authenticated for Photo upload!");
    }
    const filePath = `/${user.id}/Collection/${
      common_name.replace(regex, "_") + ".jpg"
    }`;
    const { error: updateError } = await supabase
      .from("spotted")
      .update({ image: true })
      .match({ user_id: user.id, animal_id: Number(id) });
    if (updateError) console.error("Error updating image bool", updateError);

    const { error: insertError } = await supabase.storage
      .from("profiles")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });
    if (insertError) {
      console.error(insertError);
    }

    const { error: lastImagesError } = await supabase
      .from("lastimages")
      .insert([
        {
          user_id: user.id,
          image_url:
            "https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles" +
            filePath,
        },
      ]);
    if (lastImagesError)
      console.log("ERROR INSERTING INTO LASTIMAGES", lastImagesError);

    return { success: true };
  } catch (error) {
    console.error("Error uploading file: ", error);
  }
}
