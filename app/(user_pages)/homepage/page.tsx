export const dynamic = "force-dynamic";

import { createClient } from "@/utils/supabase/server";
import AnimalOfTheDay from "../../components/home/AnimalOfTheDay";
import DailyChallenge from "../../components/home/DailyChallenge";
import { SupabaseClient } from "@supabase/supabase-js";
import { getUser } from "@/app/utils/data";
import UseFullLinks from "@/app/components/home/UseFullLinks";
import RecentUploads from "@/app/components/home/RecentUploads";
import HomeGridItem from "@/app/components/home/HomeGridItem";
import AnimalQuiz from "@/app/components/home/AnimalQuiz";
import ImageSearch from "@/app/components/home/ImageSearch";
import FollowFeed from "@/app/components/social/FollowFeed";

const getRandomDayId = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase.from("animals").select("id");
  if (error) console.error("Fehler bei Abfrage der Tier ID", error);
  const IdData = data && data.map((animal: { id: number }) => animal.id);
  const today = new Date().toISOString().split("T")[0];
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed += today.charCodeAt(i);
  }
  if (IdData) {
    const index = seed % IdData.length;
    return IdData[index];
  }
  return 1;
};

const getRandomMonthId = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase.from("animals").select("id");
  if (error) console.error("Fehler bei Abfrage der Tier ID", error);
  const IdData = data && data.map((animal: { id: number }) => animal.id);
  const month = new Date().toISOString().split("-")[1];
  let seed = 0;
  for (let i = 0; i < month.length; i++) {
    seed += month.charCodeAt(i);
  }
  if (IdData) {
    const index = seed % IdData.length;
    return IdData[index];
  }
  return 1;
};

const getAnimalOfTheDay = async (supabase: SupabaseClient) => {
  const rand = await getRandomDayId(supabase);
  try {
    if (rand !== null && rand !== undefined) {
      const { data, error } = await supabase
        .from("animals")
        .select("*")
        .eq("id", rand);
      if (error) console.error("Error getting Animal", error);
      if (data) return data[0];
    } else {
      console.error("Rand is undefined or null");
    }
    return [];
  } catch (error) {
    console.error("Error getting data from DB:", error);
  }
};
const getAnimalOfTheMonth = async (supabase: SupabaseClient) => {
  const rand = await getRandomMonthId(supabase);
  try {
    if (rand !== null && rand !== undefined) {
      const { data, error } = await supabase
        .from("animals")
        .select("*")
        .eq("id", rand);
      if (error) console.error("Error getting Animal", error);
      if (data) {
        return data[0];
      }
    } else {
      console.error("Rand is undefined or null");
    }
    return [];
  } catch (error) {
    console.error("Error getting data from DB:", error);
  }
};

const getFollowing = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);
  if (error) {
    console.error(error);
    return [];
  }
  const following = data.map((f) => f.following_id);
  return following;
};
async function getLast10Images(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("lastimages").select("*");
  if (error) return [];
  return data;
}

export default async function homepage() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  const animalOfTheMonth = await getAnimalOfTheMonth(supabase);
  const animalOfTheDay = await getAnimalOfTheDay(supabase);
  const lastImages = await getLast10Images(supabase);
  let following = [];
  if (user) {
    following = await getFollowing(supabase, user.id);
  }
  return (
    <div className="w-full flex items-center">
      <div
        className=" px-2 sm:px-0 grid gap-6 mx-auto items-center justify-center
                grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4
                 "
      >
        {" "}
        <div className="row-span-2">
          <FollowFeed following={following} />{" "}
        </div>
        <HomeGridItem>
          <AnimalOfTheDay
            data={animalOfTheDay}
            titel="Tages"
            imageUrl={animalOfTheDay.lexicon_link}
          />
        </HomeGridItem>
        <HomeGridItem>
          <AnimalOfTheDay
            data={animalOfTheMonth}
            titel="Monats"
            imageUrl={animalOfTheMonth.lexicon_link}
          />
        </HomeGridItem>
        <HomeGridItem>
          {" "}
          <DailyChallenge />
        </HomeGridItem>
        {/* <HomeGridItem>
        <UseFullLinks />
      </HomeGridItem> */}
        {/* <HomeGridItem>
          {" "}
          <RecentUploads data={lastImages} />
        </HomeGridItem> */}
        <HomeGridItem>
          {" "}
          <AnimalQuiz />
        </HomeGridItem>
        <HomeGridItem>
          {" "}
          <ImageSearch user={user} />
        </HomeGridItem>
        {/* <AnimalRecognizer /> */}
      </div>
    </div>
  );
}
