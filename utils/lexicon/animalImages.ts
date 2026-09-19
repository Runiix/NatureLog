import "server-only";
import { QUEUE_BUCKET } from "@/utils/moderation/submitImage";
import type { TypedSupabaseClient } from "@/utils/supabase/types";

export const ANIMAL_BUCKET = "animalImages";

/** The two sizes every lexicon image comes in: grid thumbnail and banner. */
export type AnimalImagePair<T> = { thumb: T; main: T };

export type StoredImage = { data: Blob; contentType: string; extension: string };

/** Credit for photos users contribute; the licence they agree to on upload. */
export const USER_PHOTO_LICENSE = {
  image_license_text: "CC BY 4.0",
  image_license_link: "https://creativecommons.org/licenses/by/4.0/",
} as const;

/** Storage keys must be ASCII; category names are German ("Säugetier"). */
const folderName = (category: string | null | undefined) =>
  (category ?? "other")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "other";

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
  const [thumb, main] = downloads.map(({ data, error }, index) => {
    if (error || !data) throw new Error(`Queued image missing: ${queuePaths[index]}`);
    return {
      data,
      contentType: data.type || "image/jpeg",
      extension: queuePaths[index].split(".").pop() ?? "jpg",
    };
  });
  return { thumb, main };
}

/**
 * Uploads a lexicon image pair to the public bucket with the caller's client
 * (the storage policy allows admins only) and returns the public URLs plus the
 * object paths, so a caller can undo the upload if its next step fails.
 */
export async function publishAnimalImages(
  supabase: TypedSupabaseClient,
  category: string | null | undefined,
  images: AnimalImagePair<StoredImage>,
): Promise<{ image_link: string; lexicon_link: string; paths: string[] }> {
  const folder = folderName(category);
  const id = crypto.randomUUID();
  const paths = {
    main: `main/${folder}/${id}.${images.main.extension}`,
    thumb: `lexicon/${folder}/${id}.${images.thumb.extension}`,
  };
  const bucket = supabase.storage.from(ANIMAL_BUCKET);
  const results = await Promise.all(
    (["thumb", "main"] as const).map((size) =>
      bucket.upload(paths[size], images[size].data, { contentType: images[size].contentType }),
    ),
  );
  const failed = results.find((result) => result.error)?.error;
  if (failed) {
    await bucket.remove([paths.thumb, paths.main]);
    throw new Error(`Animal image upload failed: ${failed.message}`);
  }
  return {
    image_link: bucket.getPublicUrl(paths.main).data.publicUrl,
    lexicon_link: bucket.getPublicUrl(paths.thumb).data.publicUrl,
    paths: [paths.thumb, paths.main],
  };
}

export async function removeAnimalImages(supabase: TypedSupabaseClient, paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(ANIMAL_BUCKET).remove(paths);
  if (error) console.error("Error removing animal images", error);
}

export async function removeQueuedImages(supabase: TypedSupabaseClient, paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(QUEUE_BUCKET).remove(paths);
  if (error) console.error("Error removing queued lexicon images", error);
}
