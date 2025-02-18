"use server";

import { createClient } from "@/utils/supabase/server";

export default async function changeFavoriteAnimal(formData: FormData) {
  const supabase = await createClient();
  const favoriteAnimal = formData.get("favorite_animal") as string;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated for Value change");
  }
  const { data, error } = await supabase
    .from("profiles")
    .update({ favorite_animal: favoriteAnimal })
    .eq("user_id", user.id);
  if (error) console.error("Error changing favorite_animal", error);
}
