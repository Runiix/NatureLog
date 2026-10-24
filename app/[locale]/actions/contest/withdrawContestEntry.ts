"use server";

import { revalidatePath } from "next/cache";
import requireAuth from "@/utils/supabase/requireAuth";
import { createAdminClient } from "@/utils/supabase/admin";
import { CONTEST_BUCKET } from "@/utils/contest/storage";
import { QUEUE_BUCKET } from "@/utils/moderation/submitImage";
import { fail, ok } from "@/app/[locale]/utils/result";

/**
 * Takes the caller's entry back while the contest still takes entries, live
 * or waiting for review, so they can enter a different photo.
 */
export default async function withdrawContestEntry(entryId: string) {
  const { supabase, user } = await requireAuth();

  // Read through the user's client: RLS returns their own entries in any state.
  const { data: entry } = await supabase
    .from("contest_entries")
    .select("id, status, thumb_path, main_path, contests(status)")
    .match({ id: entryId, user_id: user.id })
    .maybeSingle();
  if (!entry || entry.contests?.status !== "submission") return fail("closed");

  const admin = createAdminClient();
  const { data: records } = await admin
    .from("image_moderation")
    .select("id, queue_paths")
    .match({ user_id: user.id, kind: "contest_entry" })
    .eq("payload->>entryId", entry.id);

  const queuePaths = (records ?? []).flatMap((record) => record.queue_paths);
  const livePaths = [entry.thumb_path, entry.main_path].filter((path): path is string => path !== null);
  const [queueRemoval, liveRemoval] = await Promise.all([
    queuePaths.length ? admin.storage.from(QUEUE_BUCKET).remove(queuePaths) : null,
    livePaths.length ? admin.storage.from(CONTEST_BUCKET).remove(livePaths) : null,
  ]);
  const removeError = queueRemoval?.error ?? liveRemoval?.error;
  if (removeError) {
    console.error("Error removing withdrawn contest photo", removeError);
    return fail("failed");
  }

  if (records?.length) {
    const { error } = await admin
      .from("image_moderation")
      .delete()
      .in(
        "id",
        records.map((record) => record.id),
      );
    if (error) console.error("Error deleting contest moderation records", error);
  }

  const { error } = await admin.from("contest_entries").delete().eq("id", entry.id);
  if (error) {
    console.error("Error deleting contest entry", error);
    return fail("failed");
  }

  revalidatePath("/[locale]/contestpage", "page");
  return ok();
}
