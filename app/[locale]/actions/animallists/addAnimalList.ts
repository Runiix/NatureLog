"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { revalidateListPages } from "@/app/[locale]/utils/listAccess";
import { validateListFields } from "@/app/[locale]/utils/listValidation";
import { fail, ok } from "@/app/[locale]/utils/result";

export default async function addAnimalList({
  title,
  description,
  publicList,
  lat,
  lng,
}: {
  title: string;
  description: string;
  publicList: boolean;
  lat: number | null;
  lng: number | null;
}) {
  const { supabase, user } = await requireAuth();

  const fields = validateListFields({ title, description, publicList, lat, lng });
  if (!fields.success) return fields;

  const { error } = await supabase.from("animallists").insert({
    user_id: user.id,
    ...fields.data,
  });
  if (error) {
    console.error("Error adding animal list", error);
    return fail(error.message);
  }

  revalidateListPages();
  return ok();
}
