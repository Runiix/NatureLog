"use server";

import requireAdmin from "@/utils/supabase/requireAdmin";
import { createAdminClient } from "@/utils/supabase/admin";
import type { ImageKind } from "@/utils/moderation/publish";
import { parseReportedPath, reportedPathFromLink } from "@/utils/moderation/reportedImage";

export type ReportedItem = {
  /** Storage path of the reported image; identifies the card. */
  path: string;
  kind: ImageKind;
  userId: string;
  username: string | null;
  /** Null once the image is gone (deleted by its owner, or already removed). */
  imageUrl: string | null;
  reports: { id: number; text: string | null; created_at: string }[];
};

const SIGNED_URL_SECONDS = 60 * 60;

/**
 * Open reports, one entry per reported image (an image can be reported many
 * times), most recently reported first.
 */
export default async function getReports(): Promise<ReportedItem[]> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: rows, error } = await admin
    .from("reports")
    .select("id, image_link, report_text, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error loading reports", error);
    throw new Error("Could not load the reports");
  }

  const items = new Map<string, ReportedItem>();
  for (const row of rows) {
    const path = reportedPathFromLink(row.image_link);
    const image = path ? parseReportedPath(path) : null;
    if (!image) {
      console.error("Report does not point to a user image", row.id, row.image_link);
      continue;
    }
    const report = { id: row.id, text: row.report_text, created_at: row.created_at };
    // Thumbnail and full size are the same image.
    const key = [...image.paths].sort()[0];
    const existing = items.get(key);
    if (existing) {
      existing.reports.push(report);
    } else {
      items.set(key, {
        path: image.path,
        kind: image.kind,
        userId: image.userId,
        username: null,
        imageUrl: null,
        reports: [report],
      });
    }
  }
  if (items.size === 0) return [];

  const list = [...items.values()];
  const userIds = [...new Set(list.map((item) => item.userId))];
  const [{ data: users }, { data: urls }] = await Promise.all([
    admin.from("users").select("id, display_name").in("id", userIds),
    admin.storage.from("profiles").createSignedUrls(
      list.map((item) => item.path),
      SIGNED_URL_SECONDS,
    ),
  ]);

  const names = new Map((users ?? []).map((user) => [user.id, user.display_name]));
  const signed = new Map(
    (urls ?? []).filter((entry) => !entry.error).map((entry) => [entry.path, entry.signedUrl]),
  );

  return list.map((item) => ({
    ...item,
    username: names.get(item.userId) ?? null,
    imageUrl: signed.get(item.path) ?? null,
  }));
}
