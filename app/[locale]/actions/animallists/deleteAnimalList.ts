"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { revalidateListPages } from "@/app/[locale]/utils/listAccess";
import { fail, ok } from "@/app/[locale]/utils/result";

export default async function deleteAnimalList(listId: string) {
  const { supabase, user } = await requireAuth();

  const { data, error } = await supabase
    .from("animallists")
    .delete()
    .eq("id", listId)
    .eq("user_id", user.id)
    .select("id");
  if (error) {
    console.error("Error deleting animal list", error);
    return fail("failed");
  }
  // A filtered delete that matches nothing is not an error to Postgres; it is
  // to the user, who would otherwise see "deleted" for a list that remains.
  if (data.length === 0) return fail("List not found");

  revalidateListPages();
  return ok();
}
