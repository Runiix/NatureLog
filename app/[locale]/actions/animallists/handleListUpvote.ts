"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "../../utils/data";

export default async function handleListUpvotes(
  listId: string,
  hasUpvoted: boolean
) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return;
  if (hasUpvoted) {
    const { error } = await supabase
      .from("listupvotes")
      .delete()
      .eq("user_id", user.id)
      .eq("list_id", listId);
    if (error) {
      console.error("Error removing upvote", error);
      return;
    }
  } else {
    const { error } = await supabase
      .from("listupvotes")
      .insert([{ user_id: user.id, list_id: listId }]);
    if (error) {
      console.error("Error adding upvote", error);
      return;
    }
  }
}
