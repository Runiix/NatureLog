import type { TypedSupabaseClient } from "@/utils/supabase/types";

/**
 * The public lexicon image bucket. Kept free of `server-only` so the
 * invertebrate import script can publish images the same way the admin
 * actions do.
 */
export const ANIMAL_BUCKET = "animalImages";

/** The two sizes every lexicon image comes in: grid thumbnail and banner. */
export type AnimalImagePair<T> = { thumb: T; main: T };

export type StoredImage = { data: Blob; contentType: string; extension: string };

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
