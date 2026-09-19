import type { TypedSupabaseClient } from "./types";

/** Whether the session behind `supabase` has the admin role. */
export async function getIsAdmin(supabase: TypedSupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_admin");
  if (error) {
    console.error("Error checking admin role", error);
    return false;
  }
  return data === true;
}
