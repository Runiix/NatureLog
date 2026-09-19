"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { revalidateListPages } from "@/app/[locale]/utils/listAccess";
import { validateListFields } from "@/app/[locale]/utils/listValidation";
import { fail, ok } from "@/app/[locale]/utils/result";

export default async function editAnimalList(
  title: string,
  listId: string,
  description: string,
  publicList: boolean,
) {
  const { supabase, user } = await requireAuth();

  // lat/lng are left out on purpose: editing text must not touch the location.
  const fields = validateListFields({ title, description, publicList });
  if (!fields.success) return fields;

  const { data, error } = await supabase
    .from("animallists")
    .update(fields.data)
    .eq("id", listId)
    .eq("user_id", user.id)
    .select("id");
  if (error) {
    console.error("Error editing animal list", error);
    return fail(error.message);
  }
  if (data.length === 0) return fail("List not found");

  revalidateListPages();
  return ok();
}
