import "server-only";
import { QUEUE_BUCKET } from "@/utils/moderation/submitImage";
import type { TypedSupabaseClient } from "@/utils/supabase/types";
import { validateImage } from "@/utils/supabase/imageUpload";
import type { AnimalImagePair, StoredImage } from "./animalStorage";

export {
  ANIMAL_BUCKET,
  publishAnimalImages,
  removeAnimalImages,
  type AnimalImagePair,
  type StoredImage,
} from "./animalStorage";

/** Credit for photos users contribute; the licence they agree to on upload. */
export const USER_PHOTO_LICENSE = {
  image_license_text: "CC BY 4.0",
  image_license_link: "https://creativecommons.org/licenses/by/4.0/",
} as const;

/**
 * Queue paths for a user's proposal images. The storage policy only lets a
 * user write under lexicon/<their id>/.
 */
export const queuePathsFor = (userId: string, images: AnimalImagePair<{ extension: string }>) => ({
  thumb: `lexicon/${userId}/${crypto.randomUUID()}.${images.thumb.extension}`,
  main: `lexicon/${userId}/${crypto.randomUUID()}.${images.main.extension}`,
});

/** Uploads both sizes to the queue with the caller's client. Order: [thumb, main]. */
export async function queueImages(
  supabase: TypedSupabaseClient,
  userId: string,
  images: AnimalImagePair<StoredImage>,
): Promise<string[]> {
  const paths = queuePathsFor(userId, images);
  const results = await Promise.all(
    (["thumb", "main"] as const).map((size) =>
      supabase.storage
        .from(QUEUE_BUCKET)
        .upload(paths[size], images[size].data, { contentType: images[size].contentType }),
    ),
  );
  const failed = results.find((result) => result.error)?.error;
  if (failed) {
    await supabase.storage.from(QUEUE_BUCKET).remove([paths.thumb, paths.main]);
    throw new Error(`Queue upload failed: ${failed.message}`);
  }
  return [paths.thumb, paths.main];
}

/** Downloads a proposal's queued images, stored as [thumb, main]. */
export async function downloadQueuedImages(
  supabase: TypedSupabaseClient,
  queuePaths: string[],
): Promise<AnimalImagePair<StoredImage>> {
  if (queuePaths.length !== 2) throw new Error("A proposal image needs two queued files");
  const downloads = await Promise.all(
    queuePaths.map((path) => supabase.storage.from(QUEUE_BUCKET).download(path)),
  );
  // A user can write to their queue folder directly, bypassing the server
  // action, so the stored type and path extension are untrusted: re-sniff the
  // bytes before anything reaches the public bucket.
  const [thumb, main] = await Promise.all(
    downloads.map(async ({ data, error }, index) => {
      if (error || !data) throw new Error(`Queued image missing: ${queuePaths[index]}`);
      const image = await validateImage(new File([data], queuePaths[index]));
      if (!image) throw new Error(`Queued image is not a valid image: ${queuePaths[index]}`);
      return { data, contentType: image.contentType, extension: image.extension };
    }),
  );
  return { thumb, main };
}

export async function removeQueuedImages(supabase: TypedSupabaseClient, paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(QUEUE_BUCKET).remove(paths);
  if (error) console.error("Error removing queued lexicon images", error);
}
