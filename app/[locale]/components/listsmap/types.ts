import type { Tables } from "@/utils/supabase/types";

/** One public list placed on the lists map, with its stats already resolved. */
export type MapMarker = {
  id: string;
  title: string | null;
  description: string | null;
  entry_count: number;
  lat: number;
  lng: number;
  username: string;
  upvotes: number;
  created_at: string;
  /** Distinct animals in the list. */
  animal_ids: number[];
};

export type MapAnimal = Pick<
  Tables<"animals">,
  "id" | "common_name" | "scientific_name" | "category" | "lexicon_link"
>;

/** Animals referenced by the lists on the map, keyed by id. */
export type MapAnimals = Record<number, MapAnimal>;
