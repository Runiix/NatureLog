"use server";

import { revalidatePath } from "next/cache";
import requireAdmin from "@/utils/supabase/requireAdmin";
import { createAdminClient } from "@/utils/supabase/admin";
import { fail, ok } from "@/app/[locale]/utils/result";
import type { PublishPayload } from "@/utils/moderation/publish";
import { QUEUE_BUCKET } from "@/utils/moderation/submitImage";

/** Deletes a quarantined image; it never goes live. */
export default async function rejectImage(id: string) {
  const { user } = await requireAdmin();
  const admin = createAdminClient();

  const { data: row } = await admin
    .from("image_moderation")
    .select("kind, user_id, payload, queue_paths")
    .match({ id, status: "pending" })
    .maybeSingle();
  if (!row) return fail("Image not found");

  const { error: removeError } = await admin.storage.from(QUEUE_BUCKET).remove(row.queue_paths);
  if (removeError) {
    console.error("Error deleting queued image", removeError);
    return fail("Could not delete the image");
  }

  // A rejected contest photo takes its waiting entry with it, so the user can
  // enter another photo.
  const { entryId } = row.payload as PublishPayload;
  if (row.kind === "contest_entry" && entryId) {
    const { error } = await admin
      .from("contest_entries")
      .delete()
      .match({ id: entryId, user_id: row.user_id, status: "pending" });
    if (error) console.error("Error deleting rejected contest entry", error);
  }

  const { error } = await admin
    .from("image_moderation")
    .update({
      status: "rejected",
      decided_by: "admin",
      queue_paths: [],
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) console.error("Error updating moderation record", error);

  revalidatePath("/", "layout");
  return ok();
}
