"use server";

import { revalidatePath } from "next/cache";
import requireAdmin from "@/utils/supabase/requireAdmin";
import { createAdminClient } from "@/utils/supabase/admin";
import { addWeeks, weekStartOf } from "@/app/[locale]/utils/contestBracket";
import { fail, ok } from "@/app/[locale]/utils/result";

const UNIQUE_VIOLATION = "23505";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Plans a species for a future contest week. This week's contest is already
 * running, so the earliest week is next week. Contests are written by the
 * server only, hence the service role after the admin check.
 */
export default async function scheduleContest(animalId: number, weekStart: string) {
  const { supabase, user } = await requireAdmin();

  if (!Number.isInteger(animalId) || animalId <= 0) return fail("invalidAnimal");
  if (
    typeof weekStart !== "string" ||
    !ISO_DATE.test(weekStart) ||
    weekStartOf(new Date(`${weekStart}T00:00:00Z`)) !== weekStart ||
    weekStart < addWeeks(weekStartOf(new Date()), 1)
  ) {
    return fail("invalidWeek");
  }

  const { data: animal } = await supabase.from("animals").select("id").eq("id", animalId).maybeSingle();
  if (!animal) return fail("invalidAnimal");

  const { error } = await createAdminClient()
    .from("contests")
    .insert({ animal_id: animal.id, week_start: weekStart, status: "scheduled", scheduled_by: user.id });
  if (error) {
    if (error.code !== UNIQUE_VIOLATION) console.error("Error scheduling contest", error);
    return fail(error.code === UNIQUE_VIOLATION ? "weekTaken" : "failed");
  }

  revalidatePath("/[locale]/adminpage", "page");
  return ok();
}
