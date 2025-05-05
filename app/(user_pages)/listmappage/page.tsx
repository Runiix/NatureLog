import ClientWrapper from "@/app/components/listsmap/ClientWrapper";
import { getUser } from "@/app/utils/data";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import React from "react";

const getAnimalLists = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from("animallists")
    .select("id,user_id, title, description, entry_count, lat, lng")
    .eq("is_public", true)
    .eq("has_location", true);
  if (error) {
    console.error("Error getting AnimalLists", error);
    return [];
  }
  return data;
};
const getUsernames = async (supabase: SupabaseClient, idList: string[]) => {
  const { data: userNameData, error: userNameError } = await supabase
    .from("users")
    .select("id, display_name")
    .in("id", idList);

  if (userNameError) {
    console.error("Error getting Usernames", userNameError);
    return [];
  }
  return userNameData;
};
const getUpvotes = async (supabase: SupabaseClient, listIds: string[]) => {
  const { data, error } = await supabase
    .from("listupvotes")
    .select("id, list_id")
    .in("list_id", listIds);
  if (error) {
    console.error("Error getting Upvotes", error);
    return [];
  }
  return data;
};

export default async function listmappage() {
  const supabase = await createClient();
  const animalLists = await getAnimalLists(supabase);
  const userIdList = animalLists.map((animal) => animal.user_id);
  const animalListIdList = animalLists.map((list) => list.id);
  const userNames = await getUsernames(supabase, userIdList);
  const upvotes = await getUpvotes(supabase, animalListIdList);

  const upvoteMap: { [id: string]: number } = {};
  upvotes.forEach((upvote) => {
    const listId = upvote.list_id;
    upvoteMap[listId] = (Number(upvoteMap[listId]) || 0) + 1;
  });

  const userNameMap: { [id: string]: string } = {};
  userNames.forEach((user) => {
    userNameMap[user.id] = user.display_name;
  });
  const animalListsWithUsernames = animalLists.map((item) => ({
    ...item,
    username: userNameMap[item.user_id],
    upvotes: upvoteMap[item.id] || 0,
  }));
  return (
    <div>
      <h2 className="text-green-600 text-center text-2xl sm:text-6xl mt-16">
        Entdecke die Listen anderer Benutzer:
      </h2>
      <ClientWrapper lists={animalListsWithUsernames} />
    </div>
  );
}
