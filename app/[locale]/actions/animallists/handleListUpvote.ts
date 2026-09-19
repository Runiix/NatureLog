"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { canReadList } from "@/app/[locale]/utils/listAccess";
import { fail, ok } from "@/app/[locale]/utils/result";

const UNIQUE_VIOLATION = "23505";

/**
 * Sets the caller's upvote on a list to `upvoted`. Idempotent: the client used
 * to send its current state and the action blindly inserted, so a double click
 * wrote two rows and every count on the site was inflated.
 */
export default async function handleListUpvotes(listId: string, upvoted: boolean) {
  const { supabase, user } = await requireAuth();

  if (!(await canReadList(supabase, user.id, listId))) {
    return fail("List not found");
  }

  if (!upvoted) {
    const { error } = await supabase
      .from("listupvotes")
      .delete()
      .eq("user_id", user.id)
      .eq("list_id", listId);
    if (error) {
      console.error("Error removing upvote", error);
      return fail(error.message);
    }
    return ok();
  }

  const { data: existing, error: readError } = await supabase
    .from("listupvotes")
    .select("id")
    .eq("user_id", user.id)
    .eq("list_id", listId)
    .limit(1);
  if (readError) {
    console.error("Error reading upvote", readError);
    return fail(readError.message);
  }
  if (existing.length > 0) return ok();

  const { error } = await supabase
    .from("listupvotes")
    .insert({ user_id: user.id, list_id: listId });
  // With the (user_id, list_id) unique index in place, a concurrent second
  // insert lands here — the upvote exists, which is what was asked for.
  if (error && error.code !== UNIQUE_VIOLATION) {
    console.error("Error adding upvote", error);
    return fail(error.message);
  }
  return ok();
}
