import { createClient } from "@/utils/supabase/server";
import React from "react";
import Nav from "@/app/components/Nav";
import CollectionAnimalGrid from "@/app/components/CollectionAnimalGrid";

const getUser = async (supabase: any) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) console.error("Error fetching user", error);
  return user;
};

const getSpottedList = async (supabase: any, userId: any) => {
  const { data, error } = await supabase
    .from("spotted")
    .select("animal_id")
    .eq("user_id", userId);
  if (error) console.error("Error getting spotted List", error);
  else {
    const spottedIds = data.map((animal: any) => animal.animal_id);
    return spottedIds;
  }
};

const getAnimals = async (supabase: any, spottedList: [number]) => {
  const { data, error } = await supabase
    .from("animals")
    .select("*")
    .in("id", spottedList)
    .order("common_name", { ascending: true });
  if (error) console.error("Error getting Animals", error);
  else return data;
};
const getAnimalCount = async (supabase: any, genus: string) => {
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
};

export default async function collectionpage() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  const spottedList = await getSpottedList(supabase, user.id);
  const animals = await getAnimals(supabase, spottedList);
  const mammalCount = await getAnimalCount(supabase, "Säugetier");
  const birdCount = await getAnimalCount(supabase, "Vogel");
  const reptileCount = await getAnimalCount(supabase, "Reptil");
  const amphibiaCount = await getAnimalCount(supabase, "Amphibie");
  const insectCount = await getAnimalCount(supabase, "Insekt");
  const arachnoidCount = await getAnimalCount(supabase, "Arachnoid");
  const animalCount = await getAnimalCount(supabase, "all");

  return (
    <div>
      <Nav user={user} />
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
        />
      </div>
    </div>
  );
}
