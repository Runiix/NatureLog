"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { fail, ok } from "@/app/[locale]/utils/result";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Sets when the caller first spotted an animal already in their collection. */
export default async function addSpottedDate(formData: FormData) {
  const { supabase, user } = await requireAuth();

  const animalId = Number(formData.get("id"));
  const date = formData.get("date");
  if (!Number.isInteger(animalId) || animalId <= 0) return fail<string>("Invalid animal");
  if (typeof date !== "string" || !ISO_DATE.test(date) || Number.isNaN(Date.parse(date))) {
    return fail<string>("Invalid date");
  }
  if (Date.parse(date) > Date.now() + 24 * 60 * 60 * 1000) {
    return fail<string>("Date is in the future");
  }

  const { data, error } = await supabase
    .from("spotted")
    .update({ first_spotted_at: date })
    .match({ user_id: user.id, animal_id: animalId })
    .select("id");
  if (error) {
    console.error("Error updating date", error);
    return fail<string>(error.message);
  }
  if (data.length === 0) return fail<string>("Animal is not in your collection");

  return ok(date);
}
