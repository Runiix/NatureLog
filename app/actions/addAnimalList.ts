"use server";

import { createClient } from "@/utils/supabase/server";

export default async function addAnimalList({
  title,
  description,
  userId,
}: {
  title: string;
  description: string;
  userId: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("animallists").insert({
    user_id: userId,
    title: title,
    description: description,
  });
  if (error) {
    console.error("Error adding animal list", error);
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}
