import AnimalLists from "@/app/components/animallists/AnimalLists";
import { SpottedAnimal } from "@/app/utils/AnimalType";
import { getUser } from "@/app/utils/data";
import { createClient } from "@/utils/supabase/server";
import { ArrowBack } from "@mui/icons-material";
import { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";

const getAnimalLists = async (
  supabase: SupabaseClient,
  userId: string,
  onlyPublic: boolean
) => {
  if (onlyPublic === true) {
    const { data, error } = await supabase
      .from("animallists")
      .select("id, title, description, is_public, entry_count, upvotes")
      .eq("user_id", userId)
      .eq("is_public", onlyPublic.toString());
    if (error) console.error("Error getting Animal Lists", error);
    else return data;
  } else {
    const { data, error } = await supabase
      .from("animallists")
      .select("id, title, description, is_public, entry_count, upvotes")
      .eq("user_id", userId);
    if (error) console.error("Error getting Animal Lists", error);
    else return data;
  }
  return [];
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

export default async function AnimalListsPage(params: any) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  const Userparams = await params.params;
  if (!user) return <div>Loading...</div>;
  const paramUser = await getParamUserId(supabase, Userparams.username);

  if (user && paramUser && paramUser.id === user.id) {
    const animalLists = await getAnimalLists(supabase, user.id, false);
    const spottedList = await getSpottedList(supabase, user.id);
    const spottedIds: number[] = spottedList.map(
      (animal: SpottedAnimal) => animal.animal_id
    );

    return (
      <div className="w-full">
        <AnimalLists
          data={animalLists}
          user={user}
          spottedList={spottedIds}
          currUser={true}
        />
      </div>
    );
  } else {
    const animalLists = await getAnimalLists(supabase, paramUser.id, true);
    const spottedList = await getSpottedList(supabase, paramUser.id);
    const spottedIds: number[] = spottedList.map(
      (animal: SpottedAnimal) => animal.animal_id
    );
    return (
      <div className="w-full">
        <Link
          href={`/profilepage/${paramUser.display_name}`}
          className="text-xs sm:text-base absolute top-12 sm:top-20 left-5 bg-green-600 rounded-lg p-1 sm:p-2 hover:text-gray-900 hover:bg-green-700 flex items-center"
        >
          <ArrowBack />
          ZUM PROFIL
        </Link>
        <AnimalLists
          data={animalLists}
          user={paramUser}
          spottedList={spottedIds}
          currUser={false}
        />
      </div>
    );
  }
}
