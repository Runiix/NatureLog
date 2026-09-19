"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { validateImage } from "@/utils/supabase/imageUpload";
import { collectionImageName } from "@/app/[locale]/utils/storagePaths";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export default async function addCollectionImage(formData: FormData) {
  const { supabase, user } = await requireAuth();

  const animalId = Number(formData.get("id"));
  if (!Number.isInteger(animalId) || animalId <= 0) {
    return { success: false, error: "Invalid animal" };
  }

  const date = formData.get("date");
  if (date !== null && date !== "" && (typeof date !== "string" || !ISO_DATE.test(date))) {
    return { success: false, error: "Invalid date" };
  }

  const [file, modalFile] = await Promise.all([
    validateImage(formData.get("file")),
    validateImage(formData.get("modalFile")),
  ]);
  if (!file || !modalFile) return { success: false, error: "Invalid image" };

  // The object name comes from the animals table, not from the form: the old
  // client-supplied common_name only had umlauts and spaces stripped, so "/"
  // and ".." went straight into the storage key. Requiring the spotted row
  // also stops uploads for species the user never recorded.
  const [{ data: animal }, { data: spotted }] = await Promise.all([
    supabase.from("animals").select("common_name").eq("id", animalId).maybeSingle(),
    supabase
      .from("spotted")
      .select("id")
      .match({ user_id: user.id, animal_id: animalId })
      .maybeSingle(),
  ]);
  if (!animal || !spotted) {
    return { success: false, error: "Animal is not in your collection" };
  }

  const objectName = collectionImageName(animal.common_name);
  const collectionPath = `${user.id}/Collection/${objectName}`;
  const modalPath = `${user.id}/CollectionModals/${objectName}`;

  const [{ error: uploadError }, { error: modalUploadError }] = await Promise.all([
    supabase.storage.from("profiles").upload(collectionPath, file.file, {
      cacheControl: "3600",
      contentType: file.contentType,
      upsert: true,
    }),
    supabase.storage.from("profiles").upload(modalPath, modalFile.file, {
      cacheControl: "3600",
      contentType: modalFile.contentType,
      upsert: true,
    }),
  ]);
  if (uploadError || modalUploadError) {
    console.error("Error uploading collection image", uploadError ?? modalUploadError);
    return {
      success: false,
      error: (uploadError ?? modalUploadError)?.message ?? "Upload failed",
    };
  }

  const { error: spottedError } = await supabase
    .from("spotted")
    .update({
      image: true,
      image_updated_at: new Date().toISOString(),
      ...(date ? { first_spotted_at: date } : {}),
    })
    .match({ user_id: user.id, animal_id: animalId });
  if (spottedError) console.error("Error updating spotted row", spottedError);

  const { data: publicUrl } = supabase.storage
    .from("profiles")
    .getPublicUrl(collectionPath);
  const { error: lastImagesError } = await supabase.from("lastimages").insert({
    user_id: user.id,
    image_url: publicUrl.publicUrl,
    username: user.user_metadata.displayName,
  });
  if (lastImagesError) {
    console.error("Error inserting into lastimages", lastImagesError);
  }

  return { success: true, error: null };
}
