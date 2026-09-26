"use server";

import { revalidatePath } from "next/cache";
import requireAdmin from "@/utils/supabase/requireAdmin";
import { createAdminClient } from "@/utils/supabase/admin";
import { fail, ok } from "@/app/[locale]/utils/result";
import { unpublishImage } from "@/utils/moderation/publish";
import {
  parseReportedPath,
  reportedPathFromLink,
  resolveReportedImage,
} from "@/utils/moderation/reportedImage";

/**
 * Takes a reported image down, marks its moderation record rejected (if it
 * has one) and closes every report about it.
 */
export default async function removeReportedImage(path: string) {
  const { user } = await requireAdmin();
  const admin = createAdminClient();

  const image = typeof path === "string" ? parseReportedPath(path) : null;
  if (!image) return fail("Invalid image");

  const { recordIds, livePaths, payload } = await resolveReportedImage(admin, image);

  try {
    await unpublishImage(image.kind, admin, image.userId, livePaths, payload);
  } catch (error) {
    console.error("Error removing reported image", error);
    return fail("Could not remove the image");
  }

  if (recordIds.length > 0) {
    const { error } = await admin
      .from("image_moderation")
      .update({
        status: "rejected",
        decided_by: "admin",
        live_paths: [],
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .in("id", recordIds);
    if (error) console.error("Error updating moderation record", error);
  }

  // Reports hold whatever URL the reporter saw, so match them by path.
  const { data: reports } = await admin.from("reports").select("id, image_link");
  const imagePaths = new Set(image.paths);
  const reportIds = (reports ?? [])
    .filter((report) => {
      const reported = reportedPathFromLink(report.image_link);
      return reported !== null && imagePaths.has(reported);
    })
    .map((report) => report.id);
  if (reportIds.length > 0) {
    const { error } = await admin.from("reports").delete().in("id", reportIds);
    if (error) console.error("Error closing reports", error);
  }

  revalidatePath("/", "layout");
  return ok();
}
