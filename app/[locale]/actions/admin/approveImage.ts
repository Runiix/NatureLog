"use server";

import { revalidatePath } from "next/cache";
import requireAdmin from "@/utils/supabase/requireAdmin";
import { createAdminClient } from "@/utils/supabase/admin";
import { fail, ok } from "@/app/[locale]/utils/result";
import { QUEUE_BUCKET } from "@/utils/moderation/submitImage";
import {
  publishImage,
  type ImageFile,
  type ImageKind,
  type PublishPayload,
} from "@/utils/moderation/publish";

/**
 * Publishes a quarantined image exactly as if it had passed the automatic
 * check, then clears it from the queue.
 */
export default async function approveImage(id: string) {
  const { user } = await requireAdmin();
  const admin = createAdminClient();

  const { data: row } = await admin
    .from("image_moderation")
    .select("*")
    .match({ id, status: "pending" })
    .maybeSingle();
  if (!row) return fail("Image not found");

  const downloads = await Promise.all(
    row.queue_paths.map((path) => admin.storage.from(QUEUE_BUCKET).download(path)),
  );
  const failed = downloads.find((download) => download.error || !download.data);
  if (failed) {
    console.error("Error downloading queued image", failed.error);
    return fail("Could not load the image");
  }
  const files: ImageFile[] = downloads.map(({ data }, index) => ({
    data: data!,
    contentType: data!.type || "image/jpeg",
    extension: row.queue_paths[index].split(".").pop() ?? "jpg",
  }));

  let livePaths: string[];
  try {
    livePaths = await publishImage(
      row.kind as ImageKind,
      admin,
      row.user_id,
      files,
      row.payload as PublishPayload,
    );
  } catch (error) {
    console.error("Error publishing approved image", error);
    return fail("Could not publish the image");
  }

  // Same as an automatic approval: records for an overwritten path go.
  await admin
    .from("image_moderation")
    .delete()
    .eq("user_id", row.user_id)
    .eq("status", "approved")
    .overlaps("live_paths", livePaths);

  const { error } = await admin
    .from("image_moderation")
    .update({
      status: "approved",
      decided_by: "admin",
      live_paths: livePaths,
      queue_paths: [],
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) console.error("Error updating moderation record", error);

  const { error: removeError } = await admin.storage.from(QUEUE_BUCKET).remove(row.queue_paths);
  if (removeError) console.error("Error clearing queued image", removeError);

  revalidatePath("/", "layout");
  return ok();
}
