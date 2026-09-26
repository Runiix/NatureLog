"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { validateImage } from "@/utils/supabase/imageUpload";
import { submitModeratedImage } from "@/utils/moderation/submitImage";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export default async function addCollectionImage(formData: FormData) {
  const { supabase, user } = await requireAuth();

  const animalId = Number(formData.get("id"));
  if (!Number.isInteger(animalId) || animalId <= 0) {
    return { success: false, pending: false, error: "Invalid animal" };
  }

  const date = formData.get("date");
  if (date !== null && date !== "" && (typeof date !== "string" || !ISO_DATE.test(date))) {
    return { success: false, pending: false, error: "Invalid date" };
  }

  const [file, modalFile] = await Promise.all([
    validateImage(formData.get("file")),
    validateImage(formData.get("modalFile")),
  ]);
  if (!file || !modalFile) return { success: false, pending: false, error: "Invalid image" };

  // Requiring the spotted row stops uploads for species the user never
  // recorded. The publisher checks it again, since approval can come later.
  const { data: spotted } = await supabase
    .from("spotted")
    .select("id")
    .match({ user_id: user.id, animal_id: animalId })
    .maybeSingle();
  if (!spotted) {
    return { success: false, pending: false, error: "Animal is not in your collection" };
  }

  // A date given with a photo waiting for review is saved right away; only
  // the photo waits.
  const outcome = await submitModeratedImage({
    kind: "collection",
    userId: user.id,
    files: [file, modalFile],
    payload: {
      animalId,
      date: typeof date === "string" && date !== "" ? date : null,
    },
  });
  if (!outcome.ok) return { success: false, pending: false, error: outcome.error };

  if (outcome.status === "pending" && typeof date === "string" && date !== "") {
    const { error } = await supabase
      .from("spotted")
      .update({ first_spotted_at: date })
      .match({ user_id: user.id, animal_id: animalId });
    if (error) console.error("Error saving spotted date", error);
  }

  return { success: true, pending: outcome.status === "pending", error: null };
}
