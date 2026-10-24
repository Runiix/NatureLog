"use server";

import { revalidatePath } from "next/cache";
import requireAdmin from "@/utils/supabase/requireAdmin";
import { advanceContests, type AdvanceReport } from "@/utils/contest/advanceContests";
import { fail, ok } from "@/app/[locale]/utils/result";

/** Runs the daily contest job right away, e.g. after scheduling or for testing. */
export default async function advanceContestsNow() {
  await requireAdmin();
  try {
    const report = await advanceContests();
    revalidatePath("/", "layout");
    return ok(report);
  } catch (error) {
    console.error("Advancing contests failed", error);
    return fail<AdvanceReport>("failed");
  }
}
