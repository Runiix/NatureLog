"use server";

import { revalidatePath } from "next/cache";
import requireAdmin from "@/utils/supabase/requireAdmin";
import { fail, ok } from "@/app/[locale]/utils/result";

/** Stores the sets' display order: each list's position in `listIds`. */
export default async function reorderSets(listIds: string[]) {
  const { supabase } = await requireAdmin();
  if (!Array.isArray(listIds) || listIds.some((id) => typeof id !== "string")) return fail("Invalid order");

  const results = await Promise.all(
    listIds.map((listId, index) =>
      supabase.from("species_sets").update({ sort_order: index }).eq("list_id", listId),
    ),
  );
  const failed = results.find((result) => result.error)?.error;
  if (failed) {
    console.error("Error reordering sets", failed);
    return fail("failed");
  }

  revalidatePath("/", "layout");
  return ok();
}
