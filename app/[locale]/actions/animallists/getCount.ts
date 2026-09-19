"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { canReadList } from "@/app/[locale]/utils/listAccess";

/** Number of animals on a list. */
export default async function getCount(listId: string) {
  const { supabase, user } = await requireAuth();
  if (!(await canReadList(supabase, user.id, listId))) return 0;

  const { count, error } = await supabase
    .from("animallistitems")
    .select("id", { count: "exact", head: true })
    .eq("list_id", listId);
  if (error) {
    console.error("Error getting count", error);
    return 0;
  }
  return count ?? 0;
}
