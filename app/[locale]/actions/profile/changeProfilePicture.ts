"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { validateImage } from "@/utils/supabase/imageUpload";

export default async function changeProfilePicture(formData: FormData) {
  const { supabase, user } = await requireAuth();

  const image = await validateImage(formData.get("file"));
  if (!image) return { success: false, error: "Invalid image" };

  // One fixed object per user, so upsert covers both first upload and
  // replacement — no need to trust a client-sent "exists" flag to pick the call.
  const { error: uploadError } = await supabase.storage
    .from("profiles")
    .upload(`${user.id}/ProfilePicture/ProfilePic.jpg`, image.file, {
      cacheControl: "3600",
      contentType: image.contentType,
      upsert: true,
    });
  if (uploadError) {
    console.error("Error uploading profile picture", uploadError);
    return { success: false, error: uploadError.message };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ profile_picture: true })
    .eq("user_id", user.id);
  if (profileError) {
    console.error("Error flagging profile picture", profileError);
    return { success: false, error: profileError.message };
  }

  return { success: true, error: null };
}
