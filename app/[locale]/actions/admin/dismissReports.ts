"use server";

import requireAdmin from "@/utils/supabase/requireAdmin";
import { createAdminClient } from "@/utils/supabase/admin";
import { fail, ok } from "@/app/[locale]/utils/result";

/** Closes the given reports and leaves the image online. */
export default async function dismissReports(reportIds: number[]) {
  await requireAdmin();

  const ids = Array.isArray(reportIds) ? reportIds.filter(Number.isInteger) : [];
  if (ids.length === 0) return fail("No reports given");

  const { error } = await createAdminClient().from("reports").delete().in("id", ids);
  if (error) {
    console.error("Error dismissing reports", error);
    return fail("Could not dismiss the reports");
  }
  return ok();
}
