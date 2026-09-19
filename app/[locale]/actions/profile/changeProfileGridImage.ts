"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { validateImage } from "@/utils/supabase/imageUpload";
import { isSafeObjectName } from "@/app/[locale]/utils/storagePaths";
import { submitModeratedImage } from "@/utils/moderation/submitImage";

/**
 * Replaces one of the caller's grid images. The client names the image to
 * replace by its object name only; the folder is always the caller's own, so a
 * crafted value can no longer point the delete at another user's files. When
 * the new image goes to review, the old one stays until it is approved.
 */
export default async function changeProfileGridImage(formData: FormData) {
  const { user } = await requireAuth();

  const oldName = formData.get("old_name");
  if (!isSafeObjectName(oldName)) {
    return { success: false, pending: false, error: "Invalid image name" };
  }

  const [file, modalFile] = await Promise.all([
    validateImage(formData.get("file")),
    validateImage(formData.get("modalFile")),
  ]);
  if (!file || !modalFile) {
    return { success: false, pending: false, error: "Invalid image" };
  }

  const outcome = await submitModeratedImage({
    kind: "profile_grid",
    userId: user.id,
    files: [file, modalFile],
    checkFile: modalFile,
    payload: { oldName },
  });
  if (!outcome.ok) return { success: false, pending: false, error: outcome.error };

  return { success: true, pending: outcome.status === "pending", error: null };
}
