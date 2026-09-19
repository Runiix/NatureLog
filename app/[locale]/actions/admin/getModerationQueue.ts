"use server";

import requireAdmin from "@/utils/supabase/requireAdmin";
import { createAdminClient } from "@/utils/supabase/admin";
import { QUEUE_BUCKET } from "@/utils/moderation/submitImage";
import type { Tables } from "@/utils/supabase/types";

export type ModerationItem = Pick<
  Tables<"image_moderation">,
  "id" | "kind" | "status" | "decided_by" | "flagged_categories" | "scores" | "created_at"
> & {
  userId: string;
  username: string | null;
  imageUrl: string | null;
};

type QueueRow = Pick<
  Tables<"image_moderation">,
  | "id"
  | "user_id"
  | "kind"
  | "status"
  | "decided_by"
  | "flagged_categories"
  | "scores"
  | "created_at"
  | "queue_paths"
  | "live_paths"
>;

const RECENT_LIMIT = 50;
const SIGNED_URL_SECONDS = 60 * 60;

/** The full-size version is the last path of every record. */
const previewPath = (paths: string[]) => paths[paths.length - 1];

/**
 * Pending images (oldest first, so nothing waits forever) and the most recent
 * approved ones, with short-lived URLs an admin can view.
 */
export default async function getModerationQueue(): Promise<{
  pending: ModerationItem[];
  recent: ModerationItem[];
}> {
  await requireAdmin();
  const admin = createAdminClient();

  const columns =
    "id, user_id, kind, status, decided_by, flagged_categories, scores, created_at, queue_paths, live_paths";
  const [{ data: pendingRows, error: pendingError }, { data: recentRows, error: recentError }] =
    await Promise.all([
      admin
        .from("image_moderation")
        .select(columns)
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
      admin
        .from("image_moderation")
        .select(columns)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(RECENT_LIMIT),
    ]);
  if (pendingError || recentError) {
    console.error("Error loading moderation queue", pendingError ?? recentError);
    throw new Error("Could not load the moderation queue");
  }

  const userIds = [...new Set([...pendingRows, ...recentRows].map((row) => row.user_id))];
  const pendingPaths = pendingRows.map((row) => previewPath(row.queue_paths)).filter(Boolean);
  const livePaths = recentRows.map((row) => previewPath(row.live_paths)).filter(Boolean);

  const [{ data: users }, { data: pendingUrls }, { data: liveUrls }] = await Promise.all([
    userIds.length
      ? admin.from("users").select("id, display_name").in("id", userIds)
      : Promise.resolve({ data: [] }),
    pendingPaths.length
      ? admin.storage.from(QUEUE_BUCKET).createSignedUrls(pendingPaths, SIGNED_URL_SECONDS)
      : Promise.resolve({ data: [] }),
    livePaths.length
      ? admin.storage.from("profiles").createSignedUrls(livePaths, SIGNED_URL_SECONDS)
      : Promise.resolve({ data: [] }),
  ]);

  const names = new Map((users ?? []).map((user) => [user.id, user.display_name]));
  const urls = new Map(
    [...(pendingUrls ?? []), ...(liveUrls ?? [])].map((entry) => [entry.path, entry.signedUrl]),
  );

  const toItem =
    (pathsOf: (row: QueueRow) => string[]) =>
    (row: QueueRow): ModerationItem => ({
      id: row.id,
      kind: row.kind,
      status: row.status,
      decided_by: row.decided_by,
      flagged_categories: row.flagged_categories,
      scores: row.scores,
      created_at: row.created_at,
      userId: row.user_id,
      username: names.get(row.user_id) ?? null,
      imageUrl: urls.get(previewPath(pathsOf(row))) ?? null,
    });

  return {
    pending: pendingRows.map(toItem((row) => row.queue_paths)),
    recent: recentRows.map(toItem((row) => row.live_paths)),
  };
}
