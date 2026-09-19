"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { canViewProfile } from "@/app/[locale]/utils/visibility";
import type { TypedSupabaseClient } from "@/utils/supabase/types";
import { createAdminClient } from "@/utils/supabase/admin";
import { QUEUE_BUCKET } from "@/utils/moderation/submitImage";
import type { ProfileGridImage } from "@/app/[locale]/components/profile/Picturegrid";

async function getSignedUrl(
  supabase: TypedSupabaseClient,
  bucket: string,
  path: string,
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60);

  if (error) {
    console.error(`Error generating signed URL for ${bucket}/${path}:`, error);
    return null;
  }

  return data?.signedUrl || null;
}

export default async function getProfileGrid(userId: string) {
  const { supabase, user } = await requireAuth();

  // Signing a URL hands out the bytes, so the visibility check has to happen
  // before any signing — being logged in is not enough to read someone else's
  // grid.
  if (!(await canViewProfile(supabase, user.id, userId))) {
    return [];
  }

  const [{ data: gridFiles, error: gridError }, { data: modalFiles, error: modalError }] =
    await Promise.all([
      supabase.storage.from("profiles").list(`${userId}/ProfileGrid/`, {
        limit: 13,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      }),
      supabase.storage.from("profiles").list(`${userId}/ProfileGridModals/`, {
        limit: 13,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      }),
    ]);

  if (gridError || !gridFiles) {
    console.error("Error fetching grid files:", gridError);
    return [];
  }

  if (modalError || !modalFiles) {
    console.error("Error fetching modal files:", modalError);
    return [];
  }

  const modalNames = new Set(modalFiles.map((file) => file.name));

  const live: ProfileGridImage[] = await Promise.all(
    gridFiles
      .filter((file) => file.name !== ".emptyFolderPlaceholder")
      .map(async (file) => {
        const [gridUrl, modalUrl] = await Promise.all([
          getSignedUrl(supabase, "profiles", `${userId}/ProfileGrid/${file.name}`),
          modalNames.has(file.name)
            ? getSignedUrl(
                supabase,
                "profiles",
                `${userId}/ProfileGridModals/${file.name}`,
              )
            : Promise.resolve(null),
        ]);

        return {
          name: file.name,
          gridUrl,
          modalUrl,
        };
      }),
  );

  // Only the owner sees their images waiting for review.
  if (user.id !== userId) return live;
  return withPendingImages(supabase, user.id, live);
}

/**
 * Adds the owner's pending grid uploads as greyed-out tiles and marks live
 * images that have a replacement waiting. The quarantine bucket has no user
 * policies, so its URLs are signed with the service role, and only for rows
 * RLS returned for this very user.
 */
async function withPendingImages(
  supabase: TypedSupabaseClient,
  userId: string,
  live: ProfileGridImage[],
): Promise<ProfileGridImage[]> {
  const { data: rows, error } = await supabase
    .from("image_moderation")
    .select("id, queue_paths, payload, created_at")
    .match({ user_id: userId, kind: "profile_grid", status: "pending" })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Error fetching pending grid images:", error);
    return live;
  }
  if (!rows.length) return live;

  const replaced = new Set<string>();
  const added = rows.filter((row) => {
    const oldName = (row.payload as { oldName?: string | null } | null)?.oldName;
    if (oldName) replaced.add(oldName);
    return !oldName;
  });

  const paths = added.flatMap((row) => row.queue_paths);
  const { data: signed } = paths.length
    ? await createAdminClient().storage.from(QUEUE_BUCKET).createSignedUrls(paths, 60 * 60)
    : { data: [] };
  const urls = new Map((signed ?? []).map((entry) => [entry.path, entry.signedUrl]));

  return [
    ...live.map((image) =>
      replaced.has(image.name) ? { ...image, replacementPending: true } : image,
    ),
    ...added.map((row) => ({
      name: row.id,
      gridUrl: urls.get(row.queue_paths[0]) ?? null,
      modalUrl: urls.get(row.queue_paths[row.queue_paths.length - 1]) ?? null,
      pending: true,
    })),
  ];
}
