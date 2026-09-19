"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { validateImage } from "@/utils/supabase/imageUpload";
import { fail, ok } from "@/app/[locale]/utils/result";

/**
 * Stores a photo for reverse image search and returns its public URL (Google
 * Lens fetches it by URL, so the `imagesearch` bucket is public).
 *
 * This used to run in the browser with the anon key: any file type, any size,
 * a client-chosen name. Now the file is validated, the name is generated, and
 * each user keeps at most their latest search image.
 */
export default async function uploadSearchImage(formData: FormData) {
  const { supabase, user } = await requireAuth();

  const image = await validateImage(formData.get("file"));
  if (!image) return fail<string>("Invalid image");

  const { data: previous } = await supabase.storage.from("imagesearch").list(user.id);
  const stale = (previous ?? [])
    .filter((file) => file.name !== ".emptyFolderPlaceholder")
    .map((file) => `${user.id}/${file.name}`);
  if (stale.length > 0) await supabase.storage.from("imagesearch").remove(stale);

  const path = `${user.id}/${crypto.randomUUID()}.${image.extension}`;
  const { error } = await supabase.storage.from("imagesearch").upload(path, image.file, {
    cacheControl: "3600",
    contentType: image.contentType,
  });
  if (error) {
    console.error("Error uploading search image", error);
    return fail<string>(error.message);
  }

  const { data } = supabase.storage.from("imagesearch").getPublicUrl(path);
  return ok(data.publicUrl);
}
