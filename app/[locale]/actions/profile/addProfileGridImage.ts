"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { validateImage } from "@/utils/supabase/imageUpload";

const MAX_GRID_IMAGES = 12;

export default async function addProfileGridImage(formData: FormData) {
  const { supabase, user } = await requireAuth();

  const [file, modalFile] = await Promise.all([
    validateImage(formData.get("file")),
    validateImage(formData.get("modalFile")),
  ]);
  if (!file || !modalFile) {
    return { success: false, profileGridFull: false, error: "Invalid image" };
  }

  const { data: existing, error: listError } = await supabase.storage
    .from("profiles")
    .list(`${user.id}/ProfileGrid`, { limit: MAX_GRID_IMAGES + 1 });
  if (listError) {
    console.error("Error listing profile grid", listError);
    return { success: false, profileGridFull: false, error: listError.message };
  }
  const imageCount = existing.filter(
    (object) => object.name !== ".emptyFolderPlaceholder",
  ).length;
  if (imageCount >= MAX_GRID_IMAGES) {
    return { success: false, profileGridFull: true, error: "Grid is full" };
  }

  // The object name is generated here, never taken from the client: the old
  // client-supplied filename was joined straight into the storage key.
  const name = `${crypto.randomUUID()}.${file.extension}`;

  const { error: gridError } = await supabase.storage
    .from("profiles")
    .upload(`${user.id}/ProfileGrid/${name}`, file.file, {
      cacheControl: "3600",
      contentType: file.contentType,
    });
  if (gridError) {
    console.error("Error uploading grid image", gridError);
    return { success: false, profileGridFull: false, error: gridError.message };
  }

  const { error: modalError } = await supabase.storage
    .from("profiles")
    .upload(`${user.id}/ProfileGridModals/${name}`, modalFile.file, {
      cacheControl: "3600",
      contentType: modalFile.contentType,
    });
  if (modalError) {
    console.error("Error uploading grid modal image", modalError);
    // Don't leave a thumbnail behind that has no full-size counterpart.
    await supabase.storage.from("profiles").remove([`${user.id}/ProfileGrid/${name}`]);
    return { success: false, profileGridFull: false, error: modalError.message };
  }

  return {
    success: true,
    profileGridFull: imageCount + 1 >= MAX_GRID_IMAGES,
    error: null,
  };
}
