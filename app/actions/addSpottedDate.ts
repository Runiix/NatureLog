"use server";

import { createClient } from "@/utils/supabase/server";

export default async function addSpottedDate(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  const date = formData.get("date") as string;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log(user?.id, id);

    if (!user) {
      throw new Error("User not authenticated for Photo upload!");
    }
    if (date) {
      const { error: dateError } = await supabase
        .from("spotted")
        .update({ first_spotted_at: date })
        .match({ user_id: user.id, animal_id: Number(id) });
      if (dateError) console.error("Error updating date", dateError);
    }
    return { success: true };
  } catch (error) {
    console.error("Error uploading file: ", error);
  }
}
