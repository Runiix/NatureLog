"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addOrRemoveAnimals(formData: any) {
  const pathName = formData.get("pathname");
  const animalId = formData.get("animalId");
  const spotted = formData.get("isSpotted");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User is not authenticated!" };
  }

  let updatedspotted: String;

  if (spotted === "true") {
    console.log("removed from spotted", spotted);
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
    console.log("Inserting");
    updatedspotted = "true";
  }

  revalidatePath(pathName);

  return { success: true, isSpotted: updatedspotted };
}
