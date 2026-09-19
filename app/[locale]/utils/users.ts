import type { TypedSupabaseClient } from "@/utils/supabase/types";

export type ProfileTarget = {
  id: string;
  displayName: string;
};

/**
 * Resolves the `[username]` route segment to the profile it addresses.
 *
 * Selects only the two columns the pages need rather than the whole row: the
 * result is handed to client components, so anything selected here ends up in
 * the RSC payload. Returns null for an unknown username so callers can render a
 * 404 instead of silently querying with an undefined id.
 */
export async function getProfileTarget(
  supabase: TypedSupabaseClient,
  username: string,
): Promise<ProfileTarget | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, display_name")
    .eq("display_name", username)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user id", error);
    return null;
  }
  if (!data) return null;

  return { id: data.id, displayName: data.display_name };
}
