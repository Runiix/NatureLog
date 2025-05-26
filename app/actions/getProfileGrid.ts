"use server";

import { createClient } from "@/utils/supabase/server";

async function getSignedUrl(bucket: string, path: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60); // 1 hour

  if (error) {
    console.error(`Error generating signed URL for ${bucket}/${path}:`, error);
    return null;
  }

  return data?.signedUrl || null;
}

export default async function getProfileGrid(userId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User is not authenticated!" };
  }

  // Fetch regular grid files
  const { data: gridFiles, error: gridError } = await supabase.storage
    .from("profiles")
    .list(`${userId}/ProfileGrid/`, {
      limit: 13,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

  // Fetch modal files
  const { data: modalFiles, error: modalError } = await supabase.storage
    .from("profiles")
    .list(`${userId}/ProfileGridModals/`, {
      limit: 13,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

  if (gridError || !gridFiles) {
    console.error("Error fetching grid files:", gridError);
    return [];
  }

  if (modalError || !modalFiles) {
    console.error("Error fetching modal files:", modalError);
    return [];
  }

  // Create a Map of modal file signed URLs by name
  const modalFileEntries = await Promise.all(
    modalFiles.map(async (file) => {
      const signedUrl = await getSignedUrl("profiles", `${userId}/ProfileGridModals/${file.name}`);
      return [file.name, signedUrl] as [string, string | null];
    })
  );

  const modalUrlMap = new Map(modalFileEntries);

  // Construct array of combined objects
  const result = await Promise.all(
    gridFiles
      .filter((file) => file.name !== ".emptyFolderPlaceholder")
      .map(async (file) => {
        const gridUrl = await getSignedUrl("profiles", `${userId}/ProfileGrid/${file.name}`);
        const modalUrl = await getSignedUrl("profiles", `${userId}/ProfileGridModals/${file.name}`);

        return {
          name: file.name,
          gridUrl,
          modalUrl,
        };
      })
  );

  return result;
}
