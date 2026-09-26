"use server";

import { revalidatePath } from "next/cache";
import requireAuth from "@/utils/supabase/requireAuth";
import { validateFavoriteAnimal } from "@/app/[locale]/utils/profileFields";
import { fail, ok } from "@/app/[locale]/utils/result";

export default async function changeFavoriteAnimal(formData: FormData) {
  const { supabase, user } = await requireAuth();

  const favorite = validateFavoriteAnimal(formData.get("favorite_animal"));
  if (!favorite.success) return favorite;

  const { error } = await supabase
    .from("profiles")
    .update({ favorite_animal: favorite.data })
    .eq("user_id", user.id);
  if (error) {
    console.error("Error changing favorite animal", error);
    return fail<string>("failed");
  }

  revalidatePath("/[locale]/profilepage/[username]", "page");
  return ok(favorite.data);
}
