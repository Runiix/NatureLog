"use server";

import { revalidatePath } from "next/cache";
import requireAdmin from "@/utils/supabase/requireAdmin";
import { fail, ok } from "@/app/[locale]/utils/result";
import { removeQueuedImages } from "@/utils/lexicon/animalImages";

const NOTE_MAX = 500;

/**
 * Declines an open proposal, optionally telling the user why. The queued
 * images are deleted; the proposal's text stays so the user can see what was
 * declined. Runs with the admin's session (update policy: admins, pending).
 */
export default async function rejectLexiconSubmission(id: string, note?: string) {
  const { supabase } = await requireAdmin();

  const { data: row } = await supabase
    .from("lexicon_submissions")
    .select("id, queue_paths")
    .match({ id, status: "pending" })
    .maybeSingle();
  if (!row) return fail("Suggestion not found");

  const reviewNote = note?.trim().slice(0, NOTE_MAX) || null;
  const { data: decided, error } = await supabase
    .from("lexicon_submissions")
    .update({ status: "rejected", review_note: reviewNote, queue_paths: [] })
    .match({ id, status: "pending" })
    .select("id")
    .maybeSingle();
  if (error || !decided) {
    console.error("Error rejecting lexicon suggestion", error);
    return fail("Could not reject the suggestion");
  }

  await removeQueuedImages(supabase, row.queue_paths);
  revalidatePath("/", "layout");
  return ok();
}
