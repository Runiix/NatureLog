"use server";

import { revalidatePath } from "next/cache";
import requireAdmin from "@/utils/supabase/requireAdmin";
import { createAdminClient } from "@/utils/supabase/admin";
import { ANIMAL_BUCKET, ANIMAL_IMAGE_FIELDS, removeAnimalImages } from "@/utils/lexicon/animalImages";
import type { TablesUpdate } from "@/utils/supabase/types";
import { fail, ok } from "@/app/[locale]/utils/result";

/**
 * The admin veto: puts back the lexicon image a contest winner replaced and
 * deletes the copied photo. Refused when the lexicon image has changed again
 * since, so a later edit is never overwritten.
 */
export default async function revertContestWinner(contestId: string) {
  const { supabase } = await requireAdmin();
  const admin = createAdminClient();

  const { data: contest } = await admin
    .from("contests")
    .select("id, animal_id, previous_image, published_paths, vetoed_at")
    .match({ id: contestId, status: "finished" })
    .maybeSingle();
  if (!contest || contest.vetoed_at || contest.published_paths.length < 2 || !contest.previous_image) {
    return fail("notPublished");
  }

  // published_paths is [thumb, main]; the animal still showing the winner means
  // its image_link is the main photo's URL.
  const winnerUrl = supabase.storage.from(ANIMAL_BUCKET).getPublicUrl(contest.published_paths[1]).data.publicUrl;
  const { data: animal } = await supabase.from("animals").select("image_link").eq("id", contest.animal_id).maybeSingle();
  if (!animal || animal.image_link !== winnerUrl) return fail("imageChanged");

  const previous = contest.previous_image as Record<string, string | null>;
  const update: TablesUpdate<"animals"> = Object.fromEntries(ANIMAL_IMAGE_FIELDS.map((field) => [field, previous[field] ?? null]));

  // The animals policy lets admins update with their own session.
  const { data: updated, error } = await supabase
    .from("animals")
    .update(update)
    .eq("id", contest.animal_id)
    .select("id")
    .maybeSingle();
  if (error || !updated) {
    console.error("Error restoring the lexicon image", error);
    return fail("failed");
  }

  await removeAnimalImages(supabase, contest.published_paths);
  const { error: contestError } = await admin
    .from("contests")
    .update({ vetoed_at: new Date().toISOString() })
    .eq("id", contest.id);
  if (contestError) console.error("Error marking contest vetoed", contestError);

  revalidatePath("/", "layout");
  return ok();
}
