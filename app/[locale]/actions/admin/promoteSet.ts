"use server";

import { revalidatePath } from "next/cache";
import requireAdmin from "@/utils/supabase/requireAdmin";
import { fail, ok } from "@/app/[locale]/utils/result";

/** Makes one of the admin's public lists a species set, shown last. */
export default async function promoteSet(listId: string) {
  const { supabase, user } = await requireAdmin();

  const { data: list } = await supabase
    .from("animallists")
    .select("id")
    .match({ id: listId, user_id: user.id, is_public: true })
    .maybeSingle();
  if (!list) return fail("List not found");

  const { data: last } = await supabase
    .from("species_sets")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase
    .from("species_sets")
    .upsert({ list_id: listId, sort_order: (last?.sort_order ?? -1) + 1 }, { onConflict: "list_id", ignoreDuplicates: true });
  if (error) {
    console.error("Error promoting set", error);
    return fail("failed");
  }

  revalidatePath("/", "layout");
  return ok();
}
