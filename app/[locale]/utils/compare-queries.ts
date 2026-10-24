import type { TypedSupabaseClient } from "@/utils/supabase/types";
import { fetchAllRows } from "./animalLists";
import type { Owned } from "./compareCollections";
import { isInvertebrate } from "./lexiconFilters";

/** A collected species with what the compare views show about it. */
export type CompareAnimal = Owned & {
  commonName: string;
  lexiconLink: string | null;
};

/**
 * One user's collection as compare rows. Paged, since a collection can pass
 * PostgREST's 1000-row cap once invertebrates are counted. Invertebrates are
 * left out when the viewer hides them, for both sides alike.
 */
export async function getOwnedAnimals(
  supabase: TypedSupabaseClient,
  userId: string,
  hideInvertebrates: boolean,
): Promise<CompareAnimal[]> {
  const rows = await fetchAllRows(
    (from, to) =>
      supabase
        .from("spotted")
        .select("id, animal_id, image, animals(common_name, category, lexicon_link)")
        .eq("user_id", userId)
        .order("id")
        .range(from, to),
    "compare collection",
  );

  // A sighting whose animal row is gone cannot be named.
  return rows.flatMap((row) =>
    row.animal_id !== null && row.animals && !(hideInvertebrates && isInvertebrate(row.animals.category))
      ? [
          {
            animalId: row.animal_id,
            hasPhoto: row.image === true,
            commonName: row.animals.common_name,
            lexiconLink: row.animals.lexicon_link,
          },
        ]
      : [],
  );
}
