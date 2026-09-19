"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { removeQueuedImages } from "@/utils/lexicon/animalImages";
import { fail, ok } from "@/app/[locale]/utils/result";

/**
 * Lets the owner take back a proposal nobody has decided yet. Runs with the
 * user's own session: the delete policy only matches their own pending rows,
 * and the storage policy only their own queue folder.
 */
export default async function withdrawLexiconSuggestion(id: string) {
  const { supabase, user } = await requireAuth();

  const { data: row, error } = await supabase
    .from("lexicon_submissions")
    .delete()
    .match({ id, user_id: user.id, status: "pending" })
    .select("queue_paths")
    .maybeSingle();
  if (error) {
    console.error("Error withdrawing lexicon suggestion", error);
    return fail("Could not withdraw the suggestion");
  }
  if (!row) return fail("Suggestion not found");

  await removeQueuedImages(supabase, row.queue_paths);
  return ok();
}
