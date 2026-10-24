"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { fail, ok } from "@/app/[locale]/utils/result";

const UNIQUE_VIOLATION = "23505";

/**
 * Sets the caller's like on a contest entry to `liked`. Idempotent, like list
 * upvotes. The insert policy only allows liking other users' live entries
 * while the contest takes entries.
 */
export default async function toggleEntryLike(entryId: string, liked: boolean) {
  const { supabase, user } = await requireAuth();

  if (!liked) {
    const { error } = await supabase
      .from("contest_entry_likes")
      .delete()
      .match({ entry_id: entryId, user_id: user.id });
    if (error) {
      console.error("Error removing like", error);
      return fail("failed");
    }
    return ok();
  }

  const { error } = await supabase.from("contest_entry_likes").insert({ entry_id: entryId, user_id: user.id });
  // A concurrent second insert lands on the primary key: the like exists.
  if (error && error.code !== UNIQUE_VIOLATION) {
    console.error("Error adding like", error);
    return fail("closed");
  }
  return ok();
}
