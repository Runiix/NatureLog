"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "../utils/data";

export default async function deleteUser() {
  const supabase = await createClient();
  const user = await getUser(supabase);
const {
  data: { session },
} = await supabase.auth.getSession();

const accessToken = session?.access_token;
  if (!user) return { success: false, error: "User not found" };

  const { data: collectionFiles, error: getCollectionFilesError } =
    await supabase.storage.from("profiles").list(`${user.id}/Collection`);
  if (getCollectionFilesError) {
    console.error("Error getting Collection files:", getCollectionFilesError);
    return { success: false, error: getCollectionFilesError.message };
  }
  if (collectionFiles?.length) {
    const filePaths = collectionFiles.map(
      (file) => `${user.id}/Collection/${file.name}`
    );

    const { error: collectionDeleteError } = await supabase.storage
      .from("profiles")
      .remove(filePaths);

    if (collectionDeleteError) {
      console.error("Error deleting Collection files:", collectionDeleteError);
    }
  }

  const { data: collectionModalFiles, error: getCollectionModalFilesError } =
    await supabase.storage.from("profiles").list(`${user.id}/CollectionModals`);
  if (getCollectionModalFilesError) {
    console.error(
      "Error getting Collection Modal files:",
      getCollectionModalFilesError
    );
    return { success: false, error: getCollectionModalFilesError.message };
  }
  if (collectionModalFiles?.length) {
    const filePaths = collectionModalFiles.map(
      (file) => `${user.id}/CollectionModals/${file.name}`
    );

    const { error: collectionModalsDeleteError } = await supabase.storage
      .from("profiles")
      .remove(filePaths);

    if (collectionModalsDeleteError) {
      console.error(
        "Error deleting Collection Modal files:",
        collectionModalsDeleteError
      );
    }
  }

  const { data: profileGridFiles, error: getProfileGridError } =
    await supabase.storage.from("profiles").list(`${user.id}/ProfileGrid`);
  if (getProfileGridError) {
    console.error("Error getting Profile Grid files:", getProfileGridError);
    return { success: false, error: getProfileGridError.message };
  }
  if (profileGridFiles?.length) {
    const filePaths = profileGridFiles.map(
      (file) => `${user.id}/ProfileGrid/${file.name}`
    );

    const { error: profileGridError } = await supabase.storage
      .from("profiles")
      .remove(filePaths);

    if (profileGridError) {
      console.error("Error deleting Profile Grid files:", profileGridError);
    }
  }

  const { data: profileGridModalFiles, error: getProfileGridModalError } =
    await supabase.storage
      .from("profiles")
      .list(`${user.id}/ProfileGridModals`);
  if (getProfileGridModalError) {
    console.error(
      "Error getting Profile Grid Modal files:",
      getProfileGridModalError
    );
    return { success: false, error: getProfileGridModalError.message };
  }
  if (profileGridModalFiles?.length) {
    const filePaths = profileGridModalFiles.map(
      (file) => `${user.id}/ProfileGridModals/${file.name}`
    );

    const { error: profileGridModalError } = await supabase.storage
      .from("profiles")
      .remove(filePaths);

    if (profileGridModalError) {
      console.error(
        "Error deleting Profile Grid Modal files:",
        profileGridModalError
      );
    }
  }

  const { data: profilePicFiles, error: getProfilePicError } =
    await supabase.storage.from("profiles").list(`${user.id}/ProfilePicture`);
  if (getProfilePicError) {
    console.error("Error getting Profile Picture files:", getProfilePicError);
    return { success: false, error: getProfilePicError.message };
  }
  if (profilePicFiles?.length) {
    const filePaths = profilePicFiles.map(
      (file) => `${user.id}/ProfilePicture/${file.name}`
    );

    const { error: profilePicError } = await supabase.storage
      .from("profiles")
      .remove(filePaths);

    if (profilePicError) {
      console.error("Error deleting Profile Picture files:", profilePicError);
    }
  }

  const { data: searchFiles, error: getSearchFilesError } =
    await supabase.storage.from("imagesearch").list(`${user.id}`);
  if (getSearchFilesError) {
    console.error("Error getting search files:", getSearchFilesError);
    return { success: false, error: getSearchFilesError.message };
  }
  if (searchFiles?.length) {
    const filePaths = searchFiles.map((file) => `${user.id}/${file.name}`);

    const { error: searchFilesError } = await supabase.storage
      .from("profiles")
      .remove(filePaths);

    if (searchFilesError) {
      console.error("Error deleting search files:", searchFilesError);
    }
  }

  const res = await fetch(`https://umvtbsrjbvivfkcmvtxk.supabase.co/functions/v1/delete-user-account`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ user_id: user.id }), // Or just let the function get the user from JWT
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Failed to delete user: ${error}`)
  }
  return { succes: true };
}
