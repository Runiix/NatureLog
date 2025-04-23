import { createClient } from "@/utils/supabase/server";
import React from "react";
import CollectionAnimalGrid from "@/app/components/collection/CollectionAnimalGrid";
import Link from "next/link";
import { SupabaseClient } from "@supabase/supabase-js";
import { getUser } from "@/app/utils/data";

type SpottedAnimal = {
  animal_id: number;
  image: string;
  first_spotted_at: string;
};

const getSpottedList = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from("spotted")
    .select("animal_id, image, first_spotted_at")
    .eq("user_id", userId);
  if (error) console.error("Error getting spotted List", error);
  else {
    return data;
  }
  return [];
};

const getCategoryCounts = async (
  supabase: SupabaseClient,
  spottedList: number[]
) => {
  const { data, error } = await supabase
    .from("animals")
    .select("category")
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
    if (error) console.error("Error getting Animal Count", error);
    else return data.length;
  }
  return 0;
};
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
  const counts = [
    mammalCount,
    birdCount,
    reptileCount,
    amphibiaCount,
    insectCount,
    arachnoidCount,
    animalCount,
  ];

  if (user && paramUser && paramUser.id === user.id) {
    const spottedList = await getSpottedList(supabase, user.id);
    const spottedIds: number[] = spottedList.map(
      (animal: SpottedAnimal) => animal.animal_id
    );
    const categoryCounts = await getCategoryCounts(supabase, spottedIds);
    return (
      <div>
        <h2 className="text-green-600 text-center text-2xl sm:text-6xl mt-20">
          Sammlung{" "}
        </h2>
        <div className="w-full flex items-center justify-center">
          <CollectionAnimalGrid
            categoryCounts={categoryCounts || []}
            counts={counts}
            user={user}
          />
        </div>
      </div>
    );
  } else {
    if (paramUser) {
      const spottedList = await getSpottedList(supabase, paramUser.id);
      const spottedIds: number[] = spottedList.map(
        (animal: SpottedAnimal) => animal.animal_id
      );
      const categoryCounts = await getCategoryCounts(supabase, spottedIds);
      return (
        <div>
          <Link
            href={`/profilepage/${paramUser.display_name}`}
            className="text-xs sm:text-base absolute top-12 sm:top-20 left-5 bg-green-600 rounded-lg p-1 sm:p-2 text-gray-900 hover:bg-green-700"
          >
            ZUM PROFIL
          </Link>
          <h2 className="text-green-600 text-center text-2xl sm:text-6xl mt-16">
            Sammlung{" "}
          </h2>
          <div className="w-full flex items-center justify-center">
            <CollectionAnimalGrid
              categoryCounts={categoryCounts || []}
              counts={counts}
              user={paramUser}
              currUser="false"
            />
          </div>
        </div>
      );
    }
  }
}
