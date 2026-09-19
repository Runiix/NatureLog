import type { TypedSupabaseClient } from "@/utils/supabase/types";

/** Number of species in the lexicon, for copy like "{count} native species". */
export async function getSpeciesCount(supabase: TypedSupabaseClient) {
  const { count, error } = await supabase.from("animals").select("id", { count: "exact", head: true });
  if (error) console.error("Error counting species", error);
  return count ?? 0;
}
