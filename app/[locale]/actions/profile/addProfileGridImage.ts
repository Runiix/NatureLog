"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { validateImage } from "@/utils/supabase/imageUpload";
import { submitModeratedImage } from "@/utils/moderation/submitImage";

const MAX_GRID_IMAGES = 12;

export default async function addProfileGridImage(formData: FormData) {
  const { supabase, user } = await requireAuth();

  const [file, modalFile] = await Promise.all([
    validateImage(formData.get("file")),
    validateImage(formData.get("modalFile")),
  ]);
  if (!file || !modalFile) {
    return { success: false, pending: false, profileGridFull: false, error: "Invalid image" };
  }

  // Images waiting for review count towards the cap too, or a user could
  // queue up any number of them.
  const [{ data: existing, error: listError }, { count: pendingCount, error: pendingError }] =
    await Promise.all([
      supabase.storage
        .from("profiles")
        .list(`${user.id}/ProfileGrid`, { limit: MAX_GRID_IMAGES + 1 }),
      supabase
        .from("image_moderation")
        .select("id", { count: "exact", head: true })
        .match({ user_id: user.id, kind: "profile_grid", status: "pending" })
        .is("payload->>oldName", null),
    ]);
  if (listError || pendingError) {
    console.error("Error counting profile grid", listError ?? pendingError);
    return {
      success: false,
      pending: false,
      profileGridFull: false,
      error: (listError ?? pendingError)!.message,
    };
  }
  const imageCount =
    existing.filter((object) => object.name !== ".emptyFolderPlaceholder").length +
    (pendingCount ?? 0);
  if (imageCount >= MAX_GRID_IMAGES) {
    return { success: false, pending: false, profileGridFull: true, error: "Grid is full" };
  }

  const outcome = await submitModeratedImage({
    kind: "profile_grid",
    userId: user.id,
    files: [file, modalFile],
    checkFile: modalFile,
    payload: {},
  });
  if (!outcome.ok) {
    return { success: false, pending: false, profileGridFull: false, error: outcome.error };
  }

  return {
    success: true,
    pending: outcome.status === "pending",
    profileGridFull: imageCount + 1 >= MAX_GRID_IMAGES,
    error: null,
  };
}
