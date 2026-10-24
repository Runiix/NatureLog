"use server";

import requireAdmin from "@/utils/supabase/requireAdmin";
import { getListStats } from "@/app/[locale]/utils/animalLists";

export type SetCandidate = {
  listId: string;
  title: string | null;
  entryCount: number;
  isSet: boolean;
};

/**
 * The admin's own public lists, current sets first in their display order.
 * Only own lists can become sets, so a set's species stay under the admins'
 * control.
 */
export default async function getSetCandidates(): Promise<SetCandidate[]> {
  const { supabase, user } = await requireAdmin();

  const [{ data: lists, error: listError }, { data: sets, error: setError }] = await Promise.all([
    supabase.from("animallists").select("id, title").eq("user_id", user.id).eq("is_public", true),
    supabase.from("species_sets").select("list_id").order("sort_order").order("created_at"),
  ]);
  if (listError || setError) {
    console.error("Error loading set candidates", listError ?? setError);
    return [];
  }

  const setOrder = new Map(sets.map((set, index) => [set.list_id, index]));
  const stats = await getListStats(
    supabase,
    lists.map((list) => list.id),
  );
  return lists
    .map((list) => ({
      listId: list.id,
      title: list.title,
      entryCount: stats.entryCounts[list.id] ?? 0,
      isSet: setOrder.has(list.id),
    }))
    .sort(
      (a, b) =>
        (setOrder.get(a.listId) ?? Infinity) - (setOrder.get(b.listId) ?? Infinity) ||
        (a.title ?? "").localeCompare(b.title ?? "", "de"),
    );
}
