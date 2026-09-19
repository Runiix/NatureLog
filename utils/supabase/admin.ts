import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { TypedSupabaseClient } from "./types";

/**
 * Service-role client. It bypasses every RLS policy, so it exists only on the
 * server (the `server-only` import fails the build if a client component ever
 * pulls it in) and is used only after the caller's rights have been checked:
 * publishing an image that passed moderation, and the admin actions.
 */
export function createAdminClient(): TypedSupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
