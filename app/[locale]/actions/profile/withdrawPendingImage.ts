"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { createAdminClient } from "@/utils/supabase/admin";
import { fail, ok } from "@/app/[locale]/utils/result";
import { QUEUE_BUCKET } from "@/utils/moderation/submitImage";

/**
 * Lets the owner take back one of their own images before an admin has looked
 * at it. The quarantine bucket has no user policies, so the objects are
 * removed with the service role, but only after the record is confirmed to be
 * the caller's and still pending.
 */
export default async function withdrawPendingImage(id: string) {
  const { supabase, user } = await requireAuth();

  // Read through the user's own client: RLS only returns their own records.
  const { data: row } = await supabase
    .from("image_moderation")
    .select("id, queue_paths")
    .match({ id, user_id: user.id, status: "pending" })
    .maybeSingle();
  if (!row) return fail("Image not found");

  const admin = createAdminClient();
  const { error: removeError } = await admin.storage.from(QUEUE_BUCKET).remove(row.queue_paths);
  if (removeError) {
    console.error("Error removing withdrawn image", removeError);
    return fail("Could not remove the image");
  }

  const { error } = await admin.from("image_moderation").delete().eq("id", row.id);
  if (error) console.error("Error deleting withdrawn moderation record", error);

  return ok();
}
