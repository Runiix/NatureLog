"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { validateImage } from "@/utils/supabase/imageUpload";
import { submitModeratedImage } from "@/utils/moderation/submitImage";

export default async function changeProfilePicture(formData: FormData) {
  const { user } = await requireAuth();

  const image = await validateImage(formData.get("file"));
  if (!image) return { success: false, pending: false, error: "Invalid image" };

  const outcome = await submitModeratedImage({
    kind: "profile_picture",
    userId: user.id,
    files: [image],
    payload: {},
  });
  if (!outcome.ok) return { success: false, pending: false, error: outcome.error };

  return { success: true, pending: outcome.status === "pending", error: null };
}
