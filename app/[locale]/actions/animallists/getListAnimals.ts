"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { getListAnimalIds } from "@/app/[locale]/utils/animalLists";
import { canReadList } from "@/app/[locale]/utils/listAccess";

/** The distinct animals on a list: its entry count and the base of the viewer's progress bar. */
export default async function getListAnimals(listId: string): Promise<number[]> {
  const { supabase, user } = await requireAuth();
  if (!(await canReadList(supabase, user.id, listId))) return [];
  return (await getListAnimalIds(supabase, [listId]))[listId] ?? [];
}
