"use server";

import { revalidatePath } from "next/cache";
import requireAdmin from "@/utils/supabase/requireAdmin";
import { createAdminClient } from "@/utils/supabase/admin";
import { fail, ok } from "@/app/[locale]/utils/result";

/** Drops a planned contest that has not started yet. */
export default async function unscheduleContest(contestId: string) {
  await requireAdmin();

  const { error } = await createAdminClient()
    .from("contests")
    .delete()
    .match({ id: contestId, status: "scheduled" });
  if (error) {
    console.error("Error removing scheduled contest", error);
    return fail("failed");
  }

  revalidatePath("/[locale]/adminpage", "page");
  return ok();
}
