"use server";

import { createClient } from "@/utils/supabase/server";

export default async function addAnimalList({
  title,
  description,
  userId,
  publicList,
}: {
  title: string;
  description: string;
  userId: string;
  publicList: boolean;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("animallists").insert({
    user_id: userId,
    title: title,
    description: description,
    is_public: publicList,
  });
  if (error) {
    console.error("Error adding animal list", error);
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}
