"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { fail, ok } from "@/app/[locale]/utils/result";

const UNIQUE_VIOLATION = "23505";

/**
 * Votes for `entryId` in a matchup, or moves the caller's vote there. The
 * vote policies (public.contest_can_vote) decide whether the matchup is open
 * and the caller may vote in it; a refusal comes back as "closed".
 */
export default async function castVote(matchupId: string, entryId: string) {
  const { supabase, user } = await requireAuth();

  const { data: changed, error: updateError } = await supabase
    .from("contest_votes")
    .update({ entry_id: entryId })
    .match({ matchup_id: matchupId, user_id: user.id })
    .select("matchup_id");
  if (updateError) return fail("closed");
  if (changed.length > 0) return ok();

  const { error } = await supabase
    .from("contest_votes")
    .insert({ matchup_id: matchupId, user_id: user.id, entry_id: entryId });
  if (error && error.code !== UNIQUE_VIOLATION) return fail("closed");
  return ok();
}
