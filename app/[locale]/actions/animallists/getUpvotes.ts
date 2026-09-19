"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { canReadList } from "@/app/[locale]/utils/listAccess";

/** Upvote count for a list, and whether the caller is among the upvoters. */
export default async function getUpvotes(listId: string) {
  const { supabase, user } = await requireAuth();
  if (!(await canReadList(supabase, user.id, listId))) {
    return { upvotes: 0, hasUpvoted: false };
  }

  const [{ count, error: countError }, { data: own, error: ownError }] =
    await Promise.all([
      supabase
        .from("listupvotes")
        .select("id", { count: "exact", head: true })
        .eq("list_id", listId),
      supabase
        .from("listupvotes")
        .select("id")
        .eq("list_id", listId)
        .eq("user_id", user.id)
        .limit(1),
    ]);
  if (countError) console.error("Error getting upvote count", countError);
  if (ownError) console.error("Error reading own upvote", ownError);

  return { upvotes: count ?? 0, hasUpvoted: (own?.length ?? 0) > 0 };
}
