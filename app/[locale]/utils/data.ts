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
