"use server";

import { revalidatePath } from "next/cache";
import requireAuth from "@/utils/supabase/requireAuth";
import { createAdminClient } from "@/utils/supabase/admin";
import { validateImage } from "@/utils/supabase/imageUpload";
import { IMAGE_REJECTED, submitModeratedImage } from "@/utils/moderation/submitImage";
import { contestTimeline } from "@/app/[locale]/utils/contestBracket";
import { fail, ok } from "@/app/[locale]/utils/result";

const UNIQUE_VIOLATION = "23505";

/**
 * Enters a photo into the contest that is taking entries. The species has to
 * be in the caller's collection, the caller must accept the licence (a winning
 * photo becomes the lexicon image), and each user enters one photo per
 * contest. The photo goes through the same image check as every upload: it is
 * live at once, waits for an admin, or is refused.
 *
 * Error codes are keys of Contest.errors.
 */
export default async function submitContestEntry(formData: FormData) {
  const { supabase, user } = await requireAuth();

  const contestId = formData.get("contestId");
  if (typeof contestId !== "string" || !contestId) return fail<{ pending: boolean }>("failed");
  if (formData.get("license") !== "true") return fail<{ pending: boolean }>("consentMissing");

  const [thumb, main] = await Promise.all([
    validateImage(formData.get("file")),
    validateImage(formData.get("modalFile")),
  ]);
  if (!thumb || !main) return fail<{ pending: boolean }>("invalidImage");

  const { data: contest } = await supabase
    .from("contests")
    .select("id, animal_id, status, week_start")
    .eq("id", contestId)
    .maybeSingle();
  if (
    !contest ||
    contest.status !== "submission" ||
    Date.now() >= contestTimeline(contest.week_start).votingStart.getTime()
  ) {
    return fail<{ pending: boolean }>("closed");
  }

  const { data: spotted } = await supabase
    .from("spotted")
    .select("id")
    .match({ user_id: user.id, animal_id: contest.animal_id })
    .maybeSingle();
  if (!spotted) return fail<{ pending: boolean }>("notInCollection");

  // Entries are written by the server only; the row exists first so the
  // publisher (now or on an admin's approval) knows where the photo belongs.
  const admin = createAdminClient();
  const { data: entry, error } = await admin
    .from("contest_entries")
    .insert({
      contest_id: contest.id,
      user_id: user.id,
      status: "pending",
      license_accepted_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) {
    if (error.code !== UNIQUE_VIOLATION) console.error("Error creating contest entry", error);
    return fail<{ pending: boolean }>(error.code === UNIQUE_VIOLATION ? "alreadyEntered" : "failed");
  }

  const outcome = await submitModeratedImage({
    kind: "contest_entry",
    userId: user.id,
    files: [thumb, main],
    payload: { entryId: entry.id },
  });
  if (!outcome.ok) {
    await admin.from("contest_entries").delete().eq("id", entry.id);
    return fail<{ pending: boolean }>(outcome.error === IMAGE_REJECTED ? IMAGE_REJECTED : "failed");
  }

  revalidatePath("/[locale]/contestpage", "page");
  return ok({ pending: outcome.status === "pending" });
}
