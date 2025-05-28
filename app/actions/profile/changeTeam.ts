"use server";

import { createClient } from "@/utils/supabase/server";

export default async function changeTeam(team: string, user_id: string) {
  const supabase = await createClient();
  const team_link = `https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profile_icons/teams/${team}-portrait.jpg`;

  const { data, error: reqError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user_id);
  if (reqError) throw reqError;
  if (data.length > 0) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ team_link: team_link })
      .eq("user_id", user_id);
    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await supabase
      .from("profiles")
      .insert({ user_id: user_id, team_link: team_link });
    if (insertError) throw insertError;
  }
}
