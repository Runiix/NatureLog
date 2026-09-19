"use server";

import { revalidatePath } from "next/cache";
import requireAdmin from "@/utils/supabase/requireAdmin";
import { createAdminClient } from "@/utils/supabase/admin";
import { fail, ok } from "@/app/[locale]/utils/result";
import {
  unpublishImage,
  type ImageKind,
  type PublishPayload,
} from "@/utils/moderation/publish";

/** Removes an image that is already live, e.g. one the check let through. */
export default async function takeDownImage(id: string) {
  const { user } = await requireAdmin();
  const admin = createAdminClient();

  const { data: row } = await admin
    .from("image_moderation")
    .select("*")
    .match({ id, status: "approved" })
    .maybeSingle();
  if (!row) return fail("Image not found");

  try {
    await unpublishImage(
      row.kind as ImageKind,
      admin,
      row.user_id,
      row.live_paths,
      row.payload as PublishPayload,
    );
  } catch (error) {
    console.error("Error taking image down", error);
    return fail("Could not remove the image");
  }

  const { error } = await admin
    .from("image_moderation")
    .update({
      status: "rejected",
      decided_by: "admin",
      live_paths: [],
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) console.error("Error updating moderation record", error);

  revalidatePath("/", "layout");
  return ok();
}
