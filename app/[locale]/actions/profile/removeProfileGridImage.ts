"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { isSafeObjectName } from "@/app/[locale]/utils/storagePaths";

/**
 * Deletes one of the caller's grid images by object name. The client used to
 * send two full storage paths, so the only thing keeping a caller inside their
 * own folder was the bucket policy — and the modal path it sent had a typo
 * (`ProfileGridModal/`), so full-size copies were never actually deleted.
 */
export default async function removeProfileGridImage(formData: FormData) {
  const { supabase, user } = await requireAuth();

  const name = formData.get("name");
  if (!isSafeObjectName(name)) {
    return { success: false, profileGridFull: false, error: "Invalid image name" };
  }

  const { error } = await supabase.storage
    .from("profiles")
    .remove([
      `${user.id}/ProfileGrid/${name}`,
      `${user.id}/ProfileGridModals/${name}`,
    ]);
  if (error) {
    console.error("Error removing grid image", error);
    return { success: false, profileGridFull: false, error: error.message };
  }

  return { success: true, profileGridFull: false, error: null };
}
