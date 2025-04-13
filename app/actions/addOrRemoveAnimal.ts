"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addOrRemoveAnimals(formData: FormData) {
  const pathName = formData.get("pathname") as string;
  const animalId = formData.get("animalId");
  const spotted = formData.get("isSpotted") as string;
  const supabase = await createClient();
  console.log(animalId, spotted, pathName);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User is not authenticated!" };
  }

  let updatedspotted: String;

  if (spotted === "true") {
    const { error } = await supabase
      .from("spotted")
      .delete()
      .match({ user_id: user.id, animal_id: animalId });

    if (error) {
      return { success: false, error };
    }
    updatedspotted = "false";
  } else {
    const { error } = await supabase
      .from("spotted")
      .insert({ user_id: user.id, animal_id: animalId });
    if (error) {
      console.error("error inserting Animal", error);
    }
    updatedspotted = "true";
  }

  revalidatePath(pathName);

  return { success: true, isSpotted: updatedspotted };
}
