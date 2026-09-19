"use server";

import { revalidatePath } from "next/cache";
import requireAuth from "@/utils/supabase/requireAuth";
import { isTeam, teamImageUrl } from "@/app/[locale]/utils/profileFields";
import { fail, ok } from "@/app/[locale]/utils/result";

/**
 * Sets the caller's team. The name is checked against the fixed list: it is
 * interpolated into the stored image URL, which used to accept any string.
 */
export default async function changeTeam(team: string) {
  const { supabase, user } = await requireAuth();
  if (!isTeam(team)) return fail<string>("Unknown team");

  const team_link = teamImageUrl(team);
  // Update-or-insert by hand: upsert would need a unique constraint on
  // profiles.user_id, which the schema does not guarantee.
  const { data: existing, error: readError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .limit(1);
  if (readError) {
    console.error("Error reading profile", readError);
    return fail<string>(readError.message);
  }
  const { error } =
    existing.length > 0
      ? await supabase.from("profiles").update({ team_link }).eq("user_id", user.id)
      : await supabase.from("profiles").insert({ user_id: user.id, team_link });
  if (error) {
    console.error("Error changing team", error);
    return fail<string>(error.message);
  }

  revalidatePath("/[locale]/profilepage/[username]", "page");
  return ok(team_link);
}
