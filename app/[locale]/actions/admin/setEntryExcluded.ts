"use server";

import { revalidatePath } from "next/cache";
import requireAdmin from "@/utils/supabase/requireAdmin";
import { createAdminClient } from "@/utils/supabase/admin";
import { fail, ok } from "@/app/[locale]/utils/result";

/**
 * Leaves a live entry out of the bracket, or lets it back in. This is how an
 * admin preselects: only while the contest still takes entries, since the
 * bracket is seeded from the live entries when the week ends.
 */
export default async function setEntryExcluded(entryId: string, excluded: boolean) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: entry } = await admin
    .from("contest_entries")
    .select("id, status, contests(status)")
    .eq("id", entryId)
    .maybeSingle();
  if (!entry || entry.contests?.status !== "submission") return fail("closed");
  if (entry.status !== (excluded ? "active" : "excluded")) return fail("failed");

  const { error } = await admin
    .from("contest_entries")
    .update({ status: excluded ? "excluded" : "active" })
    .eq("id", entry.id);
  if (error) {
    console.error("Error changing entry status", error);
    return fail("failed");
  }

  revalidatePath("/", "layout");
  return ok();
}
