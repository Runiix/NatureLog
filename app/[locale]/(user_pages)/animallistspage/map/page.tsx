import { getTranslations } from "next-intl/server";
import ListsMapExplorer from "@/app/[locale]/components/listsmap/ListsMapExplorer";
import type { MapAnimals } from "@/app/[locale]/components/listsmap/types";
import { PageHeader } from "@/app/[locale]/components/ui/PageHeader";
import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import { createClient } from "@/utils/supabase/server";
import { getListAnimalIds, getListStats } from "@/app/[locale]/utils/animalLists";
import type { TypedSupabaseClient } from "@/utils/supabase/types";

const getAnimalLists = async (supabase: TypedSupabaseClient) => {
  const { data, error } = await supabase
    .from("animallists")
    .select("id, user_id, title, description, lat, lng, created_at")
    .eq("is_public", true)
    .eq("has_location", true);
  if (error) {
    console.error("Error getting AnimalLists", error);
    return [];
  }
  // has_location can be true while lat/lng are still null, and a list with no
  // owner cannot be attributed — neither can be placed on the map, so both are
  // dropped here rather than rendered as a marker at (0, 0).
  return data.filter(
    (list): list is typeof list & { user_id: string; lat: number; lng: number } =>
      list.user_id !== null && list.lat !== null && list.lng !== null,
  );
};

const getUsernames = async (
  supabase: TypedSupabaseClient,
  idList: string[],
): Promise<Record<string, string>> => {
  if (idList.length === 0) return {};
  const { data, error } = await supabase
    .from("users")
    .select("id, display_name")
    .in("id", idList);

  if (error) {
    console.error("Error getting Usernames", error);
    return {};
  }
  return Object.fromEntries(data.map((user) => [user.id, user.display_name]));
};

// Ids go into the request URL, so large sets are split to keep it short.
const ANIMAL_CHUNK = 300;

const getAnimals = async (supabase: TypedSupabaseClient, ids: number[]): Promise<MapAnimals> => {
  const chunks: number[][] = [];
  for (let i = 0; i < ids.length; i += ANIMAL_CHUNK) chunks.push(ids.slice(i, i + ANIMAL_CHUNK));

  const results = await Promise.all(
    chunks.map((chunk) =>
      supabase
        .from("animals")
        .select("id, common_name, scientific_name, category, lexicon_link")
        .in("id", chunk),
    ),
  );
  const animals: MapAnimals = {};
  for (const { data, error } of results) {
    if (error) console.error("Error getting map animals", error);
    for (const animal of data ?? []) animals[animal.id] = animal;
  }
  return animals;
};

export default async function ListMapPage() {
  const supabase = await createClient();
  const animalLists = await getAnimalLists(supabase);
  const listIds = animalLists.map((list) => list.id);

  const [userNames, stats, animalIds] = await Promise.all([
    getUsernames(supabase, [...new Set(animalLists.map((list) => list.user_id))]),
    getListStats(supabase, listIds),
    getListAnimalIds(supabase, listIds),
  ]);
  const animals = await getAnimals(supabase, [...new Set(Object.values(animalIds).flat())]);

  const markers = animalLists.map((list) => ({
    ...list,
    username: userNames[list.user_id] ?? "",
    upvotes: stats.upvotes[list.id] ?? 0,
    entry_count: stats.entryCounts[list.id] ?? 0,
    animal_ids: animalIds[list.id] ?? [],
  }));

  const t = await getTranslations("Map");
  return (
    <PageShell className="max-w-7xl">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <ListsMapExplorer lists={markers} animals={animals} />
    </PageShell>
  );
}
