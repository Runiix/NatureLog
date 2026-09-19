import { createClient } from "@/utils/supabase/server";

/**
 * Gate for server actions. Establishes the caller's identity from the session
 * cookie and throws when there is none, so an action never acts on a
 * caller-supplied user id. Call it as the first statement of the action and
 * derive every ownership check from the returned user.
 */
export default async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return { supabase, user };
}
