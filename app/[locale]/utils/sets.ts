import type { TypedSupabaseClient } from "@/utils/supabase/types";
import { getListAnimalIds } from "./animalLists";

export type SpeciesSet = {
  listId: string;
  title: string | null;
  description: string | null;
  animalIds: number[];
};

/**
 * Every species set in display order, with its species. A set whose list has
 * since been made private is left out: nobody but its owner could open it.
 */
export async function getSpeciesSets(supabase: TypedSupabaseClient): Promise<SpeciesSet[]> {
  const { data, error } = await supabase
    .from("species_sets")
    .select("list_id, animallists(title, description, is_public)")
    .order("sort_order")
    .order("created_at");
  if (error) {
    console.error("Error loading species sets", error);
    return [];
  }

  const sets = data.flatMap((row) =>
    row.animallists?.is_public ? [{ listId: row.list_id, list: row.animallists }] : [],
  );
  const animalIds = await getListAnimalIds(
    supabase,
    sets.map((set) => set.listId),
  );
  return sets.map(({ listId, list }) => ({
    listId,
    title: list.title,
    description: list.description,
    animalIds: animalIds[listId] ?? [],
  }));
}
