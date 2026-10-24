"use server";

import { revalidatePath } from "next/cache";
import requireAdmin from "@/utils/supabase/requireAdmin";
import { fail, ok } from "@/app/[locale]/utils/result";

/** Turns a set back into a plain list; the list itself is untouched. */
export default async function demoteSet(listId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("species_sets").delete().eq("list_id", listId);
  if (error) {
    console.error("Error removing set", error);
    return fail("failed");
  }

  revalidatePath("/", "layout");
  return ok();
}
