export const dynamic = "force-dynamic";

import { createClient } from "@/utils/supabase/server";
import AnimalOfTheDay from "../../components/home/AnimalOfTheDay";
import DailyChallenge from "../../components/home/DailyChallenge";
import { SupabaseClient } from "@supabase/supabase-js";
import { getUser } from "@/app/[locale]/utils/data";
// import UseFullLinks from "@/app/[locale]/components/home/UseFullLinks";
import RecentUploads from "@/app/[locale]/components/home/RecentUploads";
import HomeGridItem from "@/app/[locale]/components/home/HomeGridItem";
import AnimalQuiz from "@/app/[locale]/components/home/AnimalQuiz";
import ImageSearch from "@/app/[locale]/components/home/ImageSearch";
import FollowFeed from "@/app/[locale]/components/social/FollowFeed";
import UseFullLinks from "@/app/[locale]/components/home/UseFullLinks";

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
    <div className="mx-auto  px-2 sm:px-6 flex flex-col 2xl:flex-row gap-4 sm:max-w-[75vw] md:max-w-none">
      <div className="flex flex-col md:grid gap-4 grid-cols-12 grid-rows-12 w-full 2xl:w-3/4 md:h-[130vh] xl:h-[calc(100vh-4rem)]">
        <HomeGridItem className="col-span-4 xl:col-span-3 row-span-4  xl:row-span-5">
          <AnimalOfTheDay
            data={animalOfTheMonth}
            titel="Monats"
            imageUrl={animalOfTheMonth.lexicon_link}
          />
        </HomeGridItem>
        <HomeGridItem className="col-span-8 xl:col-span-6 row-span-4 xl:row-span-5 flex flex-col sm:flex-row">
          <div className="sm:w-1/2">
            <AnimalOfTheDay
              data={animalOfTheDay}
              titel="Tages"
              imageUrl={animalOfTheDay.lexicon_link}
            />
          </div>
          <div className="sm:w-1/2">
            <DailyChallenge />
          </div>
        </HomeGridItem>

        <HomeGridItem className="col-span-3 md:col-span-5 xl:col-span-3 row-span-7 md:row-span-4  xl:row-span-6">
          <ImageSearch user={user} />
        </HomeGridItem>

        <HomeGridItem className="col-span-4 md:col-span-7 xl:col-span-4 row-span-6 md:row-span-4 xl:row-span-6">
          <AnimalQuiz />
        </HomeGridItem>
        <HomeGridItem className="col-span-5 md:col-span-7 xl:col-span-5 row-span-6 md:row-span-4 xl:row-span-6">
          <RecentUploads data={lastImages} />
        </HomeGridItem>
        <HomeGridItem className="col-span-3 md:col-span-5 xl:col-span-3 row-span-7 md:row-span-4 xl:row-span-6">
          <UseFullLinks />
        </HomeGridItem>
      </div>
      <div className="w-full 2xl:w-1/4">
        <FollowFeed following={following} />{" "}
      </div>
      {/* <AnimalRecognizer /> */}
    </div>
  );
}
