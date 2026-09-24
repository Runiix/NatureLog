import type { User } from "@supabase/supabase-js";
import type { TypedSupabaseClient } from "@/utils/supabase/types";

export const getUser = async (supabase: TypedSupabaseClient) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return user;
};

/** Whether the user hides invertebrates by default. Always false for guests. */
export const getHideInvertebrates = async (supabase: TypedSupabaseClient, user: User | null) => {
  if (!user) return false;
  const { data, error } = await supabase
    .from("profiles")
    .select("hide_invertebrates")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) console.error("Error reading invertebrate setting", error);
  return data?.hide_invertebrates ?? false;
};
