"use server";

import requireAuth from "@/utils/supabase/requireAuth";

export type ListMembership = {
  id: string;
  title: string | null;
  containsAnimal: boolean;
};

/**
 * The caller's own lists, each flagged with whether it already contains
 * `animalId` — everything the "add to list" picker needs in one call.
 *
 * It used to take a user id from the client and return that user's lists
 * including private ones, and the picker then queried list items straight
 * from the browser.
 */
export default async function getAnimalLists(animalId: number): Promise<ListMembership[]> {
  const { supabase, user } = await requireAuth();

  const [{ data: lists, error: listsError }, { data: items, error: itemsError }] =
    await Promise.all([
      supabase
        .from("animallists")
        .select("id, title")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("animallistitems")
        .select("list_id")
        .eq("user_id", user.id)
        .eq("animal_id", animalId),
    ]);
  if (listsError || itemsError) {
    console.error("Error loading lists", listsError ?? itemsError);
    return [];
  }

  const containing = new Set(items.map((item) => item.list_id));
  return lists.map((list) => ({ ...list, containsAnimal: containing.has(list.id) }));
}
