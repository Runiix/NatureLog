import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * The only Supabase client type the app should reference.
 *
 * A bare `SupabaseClient` silently drops the `Database` generic, which turns
 * every query result back into `any` — so pass this alias wherever a client
 * crosses a function boundary. Row shapes come from the generated helpers
 * (`Tables<"animals">`), never from hand-written interfaces; regenerate with
 * `npm run update-types` after a schema change.
 */
export type TypedSupabaseClient = SupabaseClient<Database>;

export type { Database };
export type { Tables, TablesInsert, TablesUpdate, Enums } from "./database.types";
