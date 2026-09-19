"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { canViewProfile } from "@/app/[locale]/utils/visibility";
import type { TypedSupabaseClient } from "@/utils/supabase/types";


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

  return Promise.all(
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
}
