"use server";

import { createClient } from "@/utils/supabase/server";

export default async function getAnimalListItem(
  listId: string,
  offset: number,
  pageSize: number
) {
  const supabase = await createClient();
  const from = offset * pageSize;
  const to = (offset + 1) * pageSize - 1;
  const { data: animalIds, error: animalIdsError } = await supabase
    .from("animallistitems")
    .select("animal_id")
    .eq("list_id", listId)
    .range(from, to);
  if (animalIdsError) {
    console.error("Error fetching animal ids", animalIdsError);
    return [];
  }
  const animalIdArray = animalIds.map(
    (item: { animal_id: number }) => item.animal_id
  );
  const { data: animalData, error: animalDataError } = await supabase
    .from("animals")
    .select("id, common_name, lexicon_link")
    .in("id", animalIdArray);
  if (animalDataError) {
    console.error("Error fetching animal data", animalDataError);
    return [];
  }
  return animalData;
}
