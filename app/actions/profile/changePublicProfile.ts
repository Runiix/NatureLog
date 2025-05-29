"use server";

import { createClient } from "@/utils/supabase/server";

export default async function changePublicProfile( userId: string, isPublic: boolean) {
  const supabase = await createClient();
    const {error}= await supabase.from("profiles").update({is_public: !isPublic}).eq("user_id", userId)
  if(error){console.error("Error changing porfile status", error)}


}
