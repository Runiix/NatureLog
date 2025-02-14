import Nav from "../../components/general/Nav";
import { createClient } from "@/utils/supabase/server";
import AnimalOfTheDay from "../../components/home/AnimalOfTheDay";
import ProfileList from "../../components/general/ProfileList";
import AnimalRecognizer from "../../components/home/AnimalRecognizer";
import DailyChallenge from "../../components/home/DailyChallenge";
import { SupabaseClient } from "@supabase/supabase-js";

const getUser = async (supabase: SupabaseClient) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

const getRandomDayId = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase.from("animals").select("id");
  if (error) console.error("Fehler bei Abfrage der Tier ID", error);
  const IdData = data && data.map((animal: any) => animal.id);
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
  const IdData = data && data.map((animal: any) => animal.id);
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
      if (data) return data[0];
    } else {
      console.error("Rand is undefined or null");
    }
    return [];
  } catch (error) {
    console.error("Error getting data from DB:", error);
  }
};
// const getUsers = async (supabase: any) => {
//   const { data, error } = await supabase.from("users").select("*");
//   if (error) console.error("ERROR FETCHING USERS", error);
//   return data;
// };
async function fileExists(
  supabase: SupabaseClient,
  imageLink: string,
  genus: string
) {
  const { data, error } = await supabase.storage
    .from("animalImages")
    .list(`main/${genus}/`, {
      limit: 1,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
      search: `${imageLink}`,
    });
  if (error) {
    console.error("Error listing files:", error);
    return false;
  }

  return data.length > 0;
}

export default async function homepage() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  const animalOfTheMonth = await getAnimalOfTheMonth(supabase);
  const monthUrlparts = animalOfTheMonth.image_link.split(
    `${animalOfTheMonth.category}/`
  );
  const monthImageUrl = monthUrlparts[1];
  const monthImageExists = await fileExists(
    supabase,
    monthImageUrl,
    animalOfTheMonth.category
  );

  const animalOfTheDay = await getAnimalOfTheDay(supabase);
  const dayUrlparts = animalOfTheDay.image_link.split(
    `${animalOfTheDay.category}/`
  );
  const dayImageUrl = dayUrlparts[1];
  const dayImageExists = await fileExists(
    supabase,
    dayImageUrl,
    animalOfTheDay.category
  );

  // const users = await getUsers(supabase);

  return (
    <div>
      <Nav user={user} />
      <main className="flex flex-col justify-center items-center gap-10 w-full ">
        <section className="flex flex-col sm:flex-row items-center gap-10 justify-center w-full">
          {dayImageExists ? (
            <AnimalOfTheDay
              data={animalOfTheDay}
              titel="Tages"
              imageUrl={animalOfTheDay.image_link}
            />
          ) : (
            <AnimalOfTheDay
              data={animalOfTheDay}
              titel="Tages"
              imageUrl={
                "https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/animalImages/main/black.png"
              }
            />
          )}
          {monthImageExists ? (
            <AnimalOfTheDay
              data={animalOfTheMonth}
              titel="Monats"
              imageUrl={animalOfTheMonth.image_link}
            />
          ) : (
            <AnimalOfTheDay
              data={animalOfTheMonth}
              titel="Monats"
              imageUrl={
                "https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/animalImages/main/black.png"
              }
            />
          )}
        </section>
        <section className="flex items-center gap-10 justify-center w-full">
          {/* <ProfileList profiles={users} /> */}

          <DailyChallenge />
        </section>

        {/* <AnimalRecognizer /> */}
      </main>
    </div>
  );
}
