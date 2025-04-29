"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "../utils/data";

export default async function getFeed(
  following: number[],
  offset: number,
  pageSize: number
) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (user) {
    const from = offset * pageSize;
    const to = (offset + 1) * pageSize - 1;

    const { data: followingFeedData, error: followingFeedError } =
      await supabase
        .from("spotted")
        .select("*")
        .in("user_id", following)
        .order("image_updated_at", { ascending: false })
        .range(from, to);
    if (followingFeedError) {
      console.error("Error getting FollowingFeed", followingFeedError);
      return [];
    }
    const followingFeedAnimalIds = followingFeedData.map(
      (animal) => animal.animal_id
    );

    const { data: userNameData, error: userNameError } = await supabase
      .from("users")
      .select("id, display_name")
      .in("id", following);

    if (userNameError) {
      console.error("Error getting Usernames", userNameError);
      return [];
    }
    const userNameMap: { [id: string]: string } = {};
    userNameData.forEach((user) => {
      userNameMap[user.id] = user.display_name;
    });

    const { data: animalNameData, error: animalNameError } = await supabase
      .from("animals")
      .select("id, common_name")
      .in("id", followingFeedAnimalIds);
    if (animalNameError) {
      console.error("Error getting AnimalNameList", animalNameError);
      return [];
    }

    const animalMap: { [id: number]: string } = {};
    animalNameData.forEach((animal) => {
      animalMap[animal.id] = animal.common_name;
    });

    const followingFeedWithNames = followingFeedData.map((item) => ({
      ...item,
      common_name: animalMap[item.animal_id],
      username: userNameMap[item.user_id],
    }));
    return followingFeedWithNames;
  }
  return [];
}
