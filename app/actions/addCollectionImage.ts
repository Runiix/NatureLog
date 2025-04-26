"use server";

import { createClient } from "@/utils/supabase/server";

export default async function addCollectionImage(formData: FormData) {
  const supabase = await createClient();
  const regex = /[äöüß ]/g;
  const common_name = formData.get("common_name") as string;
  const file = formData.get("file") as File | null;
  const modalFile = formData.get("modalFile") as File | null;
  const id = formData.get("id");
  const date = formData.get("date") as string;
  if (!file || !modalFile) {
    return { success: false, message: "No file uploaded" };
  }
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated for Photo upload!");
    }
    const filePath1 = `/${user.id}/Collection/${
      common_name.replace(regex, "_") + ".jpg"
    }`;
    const filePath2 = `/${user.id}/CollectionModals/${
      common_name.replace(regex, "_") + ".jpg"
    }`;
    const updatedAt = new Date();

    const { error: updateError } = await supabase
      .from("spotted")
      .update({ image: true })
      .match({ user_id: user.id, animal_id: Number(id) });
    if (updateError) console.error("Error updating image bool", updateError);

    const { error: dateError } = await supabase
      .from("spotted")
      .update({ image_updated_at: updatedAt })
      .match({ user_id: user.id, animal_id: Number(id) });
    if (dateError) console.error("Error updating image_updated_at", dateError);

    // Upload the image to Supabase Storage
    const { error: insertError1 } = await supabase.storage
      .from("profiles")
      .upload(filePath1, file, {
        cacheControl: "3600",
        upsert: true,
      });
    if (insertError1) {
      console.error(insertError1);
    }
    // Upload the modal image to Supabase Storage
    const { error: insertError2 } = await supabase.storage
      .from("profiles")
      .upload(filePath2, modalFile, {
        cacheControl: "3600",
        upsert: true,
      });
    if (insertError1) {
      console.error(insertError2);
    }
    // Insert the image URL into the recent images database
    const { error: lastImagesError } = await supabase
      .from("lastimages")
      .insert([
        {
          user_id: user.id,
          image_url:
            "https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles" +
            filePath1,
          username: user.user_metadata.displayName,
        },
      ]);
    if (lastImagesError)
      console.error("ERROR INSERTING INTO LASTIMAGES", lastImagesError);
    if (date) {
      const { error: dateError } = await supabase
        .from("spotted")
        .update({ first_spotted_at: date })
        .match({ user_id: user.id, animal_id: Number(id) });
      if (dateError) console.error("Error updating date", dateError);
    }
    return { success: true };
  } catch (error) {
    console.error("Error uploading file: ", error);
  }
}
