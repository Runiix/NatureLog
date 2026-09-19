import "server-only";
import { collectionImageName, isSafeObjectName } from "@/app/[locale]/utils/storagePaths";
import type { TypedSupabaseClient } from "@/utils/supabase/types";
import type { ImageKind, PublishPayload } from "./publish";

/** A live image in the `profiles` bucket, as far as a report can identify it. */
export type ReportedImage = {
  userId: string;
  kind: ImageKind;
  /** The object that was reported (usually the full-size one). */
  path: string;
  /** Every object that belongs to the image, e.g. thumbnail and full size. */
  paths: string[];
  /** collection: the object name, used to find the species. */
  name: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const FOLDERS: Record<string, { kind: ImageKind; siblings: string[] }> = {
  ProfilePicture: { kind: "profile_picture", siblings: [] },
  ProfileGrid: { kind: "profile_grid", siblings: ["ProfileGridModals"] },
  ProfileGridModals: { kind: "profile_grid", siblings: ["ProfileGrid"] },
  Collection: { kind: "collection", siblings: ["CollectionModals"] },
  CollectionModals: { kind: "collection", siblings: ["Collection"] },
};

/**
 * Reports store the URL the reporter saw, which is public or signed (with a
 * token that expires), so the storage path is the only stable part of it.
 */
export function reportedPathFromLink(link: string | null): string | null {
  if (!link) return null;
  const match = link.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/profiles\/([^?#]+)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

/** Parses `<userId>/<folder>/<name>`; anything else is not a user image. */
export function parseReportedPath(path: string): ReportedImage | null {
  const [userId, folder, name, ...rest] = path.split("/");
  const entry = FOLDERS[folder];
  if (rest.length > 0 || !UUID.test(userId) || !entry || !isSafeObjectName(name)) return null;
  return {
    userId,
    kind: entry.kind,
    path,
    paths: [path, ...entry.siblings.map((sibling) => `${userId}/${sibling}/${name}`)],
    name,
  };
}

/**
 * Finds what `unpublishImage` needs for a reported image. Images uploaded
 * since moderation exists have an approved record; older ones don't, so their
 * kind and paths come from the storage path and a collection photo's species
 * is looked up by its object name.
 */
export async function resolveReportedImage(
  admin: TypedSupabaseClient,
  image: ReportedImage,
): Promise<{ recordIds: string[]; livePaths: string[]; payload: PublishPayload }> {
  const { data: records } = await admin
    .from("image_moderation")
    .select("id, live_paths, payload")
    .match({ user_id: image.userId, status: "approved" })
    .contains("live_paths", [image.path])
    .order("created_at", { ascending: false });

  const latest = records?.[0];
  const payload = (latest?.payload ?? {}) as PublishPayload;
  const livePaths = [...new Set([...(latest?.live_paths ?? []), ...image.paths])];

  if (image.kind === "collection" && !payload.animalId) {
    const { data: spotted } = await admin
      .from("spotted")
      .select("animal_id")
      .eq("user_id", image.userId)
      .not("animal_id", "is", null);
    const animalIds = (spotted ?? []).map((row) => row.animal_id!);
    if (animalIds.length > 0) {
      const { data: animals } = await admin
        .from("animals")
        .select("id, common_name")
        .in("id", animalIds);
      const animal = animals?.find(
        (entry) => entry.common_name && collectionImageName(entry.common_name) === image.name,
      );
      if (animal) payload.animalId = animal.id;
    }
  }

  return { recordIds: (records ?? []).map((record) => record.id), livePaths, payload };
}
