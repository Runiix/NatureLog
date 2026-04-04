"use server";

import { createClient } from "@/utils/supabase/server";

export default async function getUpvotes(listId: string, userId: string) {
  const supabase = await createClient();
  const { data, error: listError } = await supabase
    .from("listupvotes")
    .select("id")
    .eq("list_id", listId);
  if (listError) {
    console.error("Error getting upvote count", listError);
    return { upvotes: 0, hasUpvoted: false };
  }
  const { data: existing, error: upvoteError } = await supabase
    .from("listupvotes")
    .select()
    .eq("user_id", userId)
    .eq("list_id", listId);
  if (upvoteError) {
    console.error("upvote Error", upvoteError);
  }
  const hasUpvoted = existing && existing.length > 0;
  if (data) {
    return { upvotes: data.length, hasUpvoted: hasUpvoted };
  } else {
    return { upvotes: 0, hasUpvoted: hasUpvoted };
  }
}
