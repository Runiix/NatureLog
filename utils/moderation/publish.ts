import "server-only";
import { collectionImageName } from "@/app/[locale]/utils/storagePaths";
import type { TypedSupabaseClient } from "@/utils/supabase/types";

export type ImageKind = "profile_picture" | "profile_grid" | "collection";

/** One stored image file, from an upload or from the quarantine bucket. */
export type ImageFile = { data: Blob; contentType: string; extension: string };

/**
 * What a publisher needs besides the files. Stored on pending moderation rows
 * so an admin approval can finish the upload exactly as the user started it.
 */
export type PublishPayload = {
  /** collection: the species the photo belongs to. */
  animalId?: number;
  /** collection: new first-spotted date (yyyy-mm-dd). */
  date?: string | null;
  /** collection: display name recorded in `lastimages`. */
  username?: string | null;
  /** profile_grid: image this one replaces. */
  oldName?: string | null;
};

const upload = async (
  client: TypedSupabaseClient,
  path: string,
  file: ImageFile,
  upsert: boolean,
) => {
  const { error } = await client.storage.from("profiles").upload(path, file.data, {
    cacheControl: "3600",
    contentType: file.contentType,
    upsert,
  });
  if (error) throw new Error(`Upload to ${path} failed: ${error.message}`);
};

/** One fixed object per user, so upsert covers first upload and replacement. */
async function publishProfilePicture(
  client: TypedSupabaseClient,
  userId: string,
  [file]: ImageFile[],
): Promise<string[]> {
  const path = `${userId}/ProfilePicture/ProfilePic.jpg`;
  await upload(client, path, file, true);

  const { error } = await client
    .from("profiles")
    .update({ profile_picture: true })
    .eq("user_id", userId);
  if (error) throw new Error(`Flagging profile picture failed: ${error.message}`);

  return [path];
}

/** Thumbnail and full size under a fresh name; replaces `oldName` if given. */
async function publishProfileGridImage(
  client: TypedSupabaseClient,
  userId: string,
  [file, modalFile]: ImageFile[],
  { oldName }: PublishPayload,
): Promise<string[]> {
  const name = `${crypto.randomUUID()}.${file.extension}`;
  const gridPath = `${userId}/ProfileGrid/${name}`;
  const modalPath = `${userId}/ProfileGridModals/${name}`;

  await upload(client, gridPath, file, false);
  try {
    await upload(client, modalPath, modalFile, false);
  } catch (error) {
    // Don't leave a thumbnail behind that has no full-size counterpart.
    await client.storage.from("profiles").remove([gridPath]);
    throw error;
  }

  // Upload first, delete second: a failed upload must not cost the user the
  // image they were replacing.
  if (oldName) {
    const { error } = await client.storage
      .from("profiles")
      .remove([`${userId}/ProfileGrid/${oldName}`, `${userId}/ProfileGridModals/${oldName}`]);
    if (error) console.error("Error removing replaced image", error);
  }

  return [gridPath, modalPath];
}

async function publishCollectionImage(
  client: TypedSupabaseClient,
  userId: string,
  [file, modalFile]: ImageFile[],
  { animalId, date, username }: PublishPayload,
): Promise<string[]> {
  // The object name comes from the animals table, never from the client, and
  // the spotted row must (still) exist.
  const [{ data: animal }, { data: spotted }] = await Promise.all([
    client.from("animals").select("common_name").eq("id", animalId!).maybeSingle(),
    client
      .from("spotted")
      .select("id")
      .match({ user_id: userId, animal_id: animalId! })
      .maybeSingle(),
  ]);
  if (!animal || !spotted) throw new Error("Animal is not in the collection");

  const objectName = collectionImageName(animal.common_name);
  const collectionPath = `${userId}/Collection/${objectName}`;
  const modalPath = `${userId}/CollectionModals/${objectName}`;

  await Promise.all([
    upload(client, collectionPath, file, true),
    upload(client, modalPath, modalFile, true),
  ]);

  const { error: spottedError } = await client
    .from("spotted")
    .update({
      image: true,
      image_updated_at: new Date().toISOString(),
      ...(date ? { first_spotted_at: date } : {}),
    })
    .match({ user_id: userId, animal_id: animalId! });
  if (spottedError) console.error("Error updating spotted row", spottedError);

  const { data: publicUrl } = client.storage.from("profiles").getPublicUrl(collectionPath);
  const { error: lastImagesError } = await client.from("lastimages").insert({
    user_id: userId,
    image_url: publicUrl.publicUrl,
    username: username ?? null,
  });
  if (lastImagesError) console.error("Error inserting into lastimages", lastImagesError);

  return [collectionPath, modalPath];
}

/**
 * Puts an approved image in its live place in the `profiles` bucket and runs
 * the same side effects the upload always had. Returns the live paths. Throws
 * on failure.
 */
export function publishImage(
  kind: ImageKind,
  client: TypedSupabaseClient,
  userId: string,
  files: ImageFile[],
  payload: PublishPayload,
): Promise<string[]> {
  switch (kind) {
    case "profile_picture":
      return publishProfilePicture(client, userId, files);
    case "profile_grid":
      return publishProfileGridImage(client, userId, files, payload);
    case "collection":
      return publishCollectionImage(client, userId, files, payload);
  }
}

/**
 * Takes a live image down again and undoes the flag that makes it show up.
 * Grid images have no flag; removing the objects is enough.
 */
export async function unpublishImage(
  kind: ImageKind,
  client: TypedSupabaseClient,
  userId: string,
  livePaths: string[],
  payload: PublishPayload,
): Promise<void> {
  if (livePaths.length > 0) {
    const { error } = await client.storage.from("profiles").remove(livePaths);
    if (error) throw new Error(`Removing images failed: ${error.message}`);
  }

  if (kind === "profile_picture") {
    const { error } = await client
      .from("profiles")
      .update({ profile_picture: false })
      .eq("user_id", userId);
    if (error) throw new Error(`Clearing profile picture failed: ${error.message}`);
  } else if (kind === "collection" && payload.animalId) {
    const { error } = await client
      .from("spotted")
      .update({ image: false })
      .match({ user_id: userId, animal_id: payload.animalId });
    if (error) throw new Error(`Clearing collection image failed: ${error.message}`);

    if (livePaths[0]) {
      const { data } = client.storage.from("profiles").getPublicUrl(livePaths[0]);
      await client.from("lastimages").delete().eq("image_url", data.publicUrl);
    }
  }
}
