"use server";

import requireAdmin from "@/utils/supabase/requireAdmin";
import { QUEUE_BUCKET } from "@/utils/moderation/submitImage";
import type { Tables } from "@/utils/supabase/types";

export type LexiconQueueItem = Pick<
  Tables<"lexicon_submissions">,
  "id" | "kind" | "created_at" | "flagged_categories" | "data"
> & {
  username: string | null;
  /** The animal the proposal changes; null for a new animal. */
  animal: Pick<
    Tables<"animals">,
    "id" | "common_name" | "category" | "description" | "image_link"
  > | null;
  /** Short-lived URL of the proposed main image, if any. */
  imageUrl: string | null;
};

const SIGNED_URL_SECONDS = 60 * 60;

/**
 * Open lexicon proposals, oldest first, with the current animal values next to
 * them for comparison. Read with the admin's own session: the select policies
 * only show every row to admins.
 */
export default async function getLexiconQueue(): Promise<LexiconQueueItem[]> {
  const { supabase } = await requireAdmin();

  const { data: rows, error } = await supabase
    .from("lexicon_submissions")
    .select(
      "id, kind, created_at, flagged_categories, data, user_id, queue_paths, animals(id, common_name, category, description, image_link)",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Error loading lexicon queue", error);
    throw new Error("Could not load the lexicon queue");
  }

  const userIds = [...new Set(rows.map((row) => row.user_id))];
  // The main image is the second queued file.
  const mainPaths = rows.map((row) => row.queue_paths[1]).filter(Boolean);

  const [{ data: users }, { data: urls }] = await Promise.all([
    userIds.length
      ? supabase.from("users").select("id, display_name").in("id", userIds)
      : Promise.resolve({ data: [] }),
    mainPaths.length
      ? supabase.storage.from(QUEUE_BUCKET).createSignedUrls(mainPaths, SIGNED_URL_SECONDS)
      : Promise.resolve({ data: [] }),
  ]);

  const names = new Map((users ?? []).map((user) => [user.id, user.display_name]));
  const signed = new Map((urls ?? []).map((entry) => [entry.path, entry.signedUrl]));

  return rows.map(({ user_id, queue_paths, animals, ...row }) => ({
    ...row,
    username: names.get(user_id) ?? null,
    animal: animals ?? null,
    imageUrl: (queue_paths[1] && signed.get(queue_paths[1])) || null,
  }));
}
