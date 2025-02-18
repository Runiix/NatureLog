import { createClient } from "@/utils/supabase/server";
import React from "react";
import Nav from "@/app/components/general/Nav";
import CollectionAnimalGrid from "@/app/components/collection/CollectionAnimalGrid";
import Link from "next/link";
import { SupabaseClient } from "@supabase/supabase-js";

const getUser = async (supabase: SupabaseClient) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) console.error("Error fetching user", error);
  return user;
};

const getSpottedList = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from("spotted")
    .select("animal_id")
    .eq("user_id", userId);
  if (error) console.error("Error getting spotted List", error);
  else {
    const spottedIds: number[] = data.map((animal: any) => animal.animal_id);
    return spottedIds;
  }
  return [];
};

const getAnimals = async (supabase: SupabaseClient, spottedList: number[]) => {
  const { data, error } = await supabase
    .from("animals")
    .select("*")
    .in("id", spottedList)
    .order("common_name", { ascending: true });
  if (error) console.error("Error getting Animals", error);
  else return data;
};
const getAnimalCount = async (supabase: SupabaseClient, genus: string) => {
  if (genus === "all") {
    const { data, error } = await supabase.from("animals").select("id");
    if (error) console.error("Error getting Animal Count", error);
    else return data.length;
  } else {
    const { data, error } = await supabase
      .from("animals")
      .select("id")
      .eq("category", genus);
    if (error) console.error("Error getting Mammal Count", error);
    else return data.length;
  }
  return 0;
};
async function getAnimalImageList(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase.storage
    .from("profiles")
    .list(`${userId}/Collection/`, {
      limit: 400,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });
  if (error) console.error("Error fetching animal images", error);
  if (data === null) return [];
  const filteredData = data.filter(
    (item: { name: string }) => item.name !== ".emptyFolderPlaceholder"
  );
  const listData: string[] = filteredData.map((animal) => animal.name);
  return listData;
}
const getParamUserId = async (supabase: SupabaseClient, username: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("display_name", username);
  if (error) console.error("Error fetching user id", error);
  if (data) return data[0];
  return [];
};

export default async function collectionpage(params: any) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  const Userparams = await params.params;
  const [
    paramUser,
    mammalCount,
    birdCount,
    reptileCount,
    amphibiaCount,
    insectCount,
    arachnoidCount,
    animalCount,
  ] = await Promise.all([
    getParamUserId(supabase, Userparams.username),
    getAnimalCount(supabase, "Säugetier"),
    getAnimalCount(supabase, "Vogel"),
    getAnimalCount(supabase, "Reptil"),
    getAnimalCount(supabase, "Amphibie"),
    getAnimalCount(supabase, "Insekt"),
    getAnimalCount(supabase, "Arachnoid"),
    getAnimalCount(supabase, "all"),
  ]);

  if (user && paramUser.id === user.id) {
    const spottedList = await getSpottedList(supabase, user.id);
    const [animals, animalImageList] = await Promise.all([
      getAnimals(supabase, spottedList),
      getAnimalImageList(supabase, user.id),
    ]);

    return (
      <div>
        <div className="w-full flex items-center justify-center">
          <CollectionAnimalGrid
            animals={animals}
            animalCount={animalCount}
            spottedList={spottedList}
            mammalCount={mammalCount}
            birdCount={birdCount}
            reptileCount={reptileCount}
            amphibiaCount={amphibiaCount}
            insectCount={insectCount}
            arachnoidCount={arachnoidCount}
            user={user}
            animalImageList={animalImageList}
          />
        </div>
      </div>
    );
  } else {
    const spottedList = await getSpottedList(supabase, paramUser.id);
    const [animals, animalImageList] = await Promise.all([
      getAnimals(supabase, spottedList),
      getAnimalImageList(supabase, paramUser.id),
    ]);

    return (
      <div>
        <Link
          href={`/profilepage/${paramUser.display_name}`}
          className="fixed top-20 left-5 bg-green-600 rounded-lg p-2 text-gray-900 hover:bg-green-700"
        >
          ZUM PROFIL
        </Link>
        <div className="w-full flex items-center justify-center">
          <CollectionAnimalGrid
            animals={animals}
            animalCount={animalCount}
            spottedList={spottedList}
            mammalCount={mammalCount}
            birdCount={birdCount}
            reptileCount={reptileCount}
            amphibiaCount={amphibiaCount}
            insectCount={insectCount}
            arachnoidCount={arachnoidCount}
            user={paramUser}
            currUser="false"
            animalImageList={animalImageList}
          />
        </div>
      </div>
    );
  }
}
