"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { validateImage } from "@/utils/supabase/imageUpload";
import { isSafeObjectName } from "@/app/[locale]/utils/storagePaths";

/**
 * Replaces one of the caller's grid images. The client names the image to
 * replace by its object name only; the folder is always the caller's own, so a
 * crafted value can no longer point the delete at another user's files.
 */
export default async function changeProfileGridImage(formData: FormData) {
  const { supabase, user } = await requireAuth();

  const oldName = formData.get("old_name");
  if (!isSafeObjectName(oldName)) {
    return { success: false, error: "Invalid image name" };
  }

  const [file, modalFile] = await Promise.all([
    validateImage(formData.get("file")),
    validateImage(formData.get("modalFile")),
  ]);
  if (!file || !modalFile) {
    return { success: false, error: "Invalid image" };
  }

  const name = `${crypto.randomUUID()}.${file.extension}`;
  const gridPath = `${user.id}/ProfileGrid/${name}`;
  const modalPath = `${user.id}/ProfileGridModals/${name}`;

  // Upload first, delete second: a failed upload must not cost the user the
  // image they were replacing.
  const { error: gridError } = await supabase.storage
    .from("profiles")
    .upload(gridPath, file.file, {
      cacheControl: "3600",
      contentType: file.contentType,
    });
  if (gridError) {
    console.error("Error uploading grid image", gridError);
    return { success: false, error: gridError.message };
  }

  const { error: modalError } = await supabase.storage
    .from("profiles")
    .upload(modalPath, modalFile.file, {
      cacheControl: "3600",
      contentType: modalFile.contentType,
    });
  if (modalError) {
    console.error("Error uploading grid modal image", modalError);
    await supabase.storage.from("profiles").remove([gridPath]);
    return { success: false, error: modalError.message };
  }

  const { error: removeError } = await supabase.storage
    .from("profiles")
    .remove([
      `${user.id}/ProfileGrid/${oldName}`,
      `${user.id}/ProfileGridModals/${oldName}`,
    ]);
  if (removeError) console.error("Error removing replaced image", removeError);

  return { success: true, error: null };
}
