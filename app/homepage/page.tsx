import Nav from "../components/Nav";
import { createClient } from "@/utils/supabase/server";
import AnimalOfTheDay from "../components/AnimalOfTheDay";
import ProfileList from "../components/ProfileList";

const getUser = async (supabase: any) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

const getRandomId = async (supabase: any) => {
  try {
    const { data, error } = await supabase.from("animals").select("id");
    if (error) console.error("Fehler bei Abfrage der Tier ID", error);
    const IdData = data.map((animal: any) => animal.id);
    const randomIndex = Math.floor(Math.random() * IdData.length);
    const randomId = IdData[randomIndex];
    return randomId;
  } catch (error) {
    console.error("Fehler bei Abfrage der Tier ID", error);
  }
};

const getAnimalOfTheDay = async (supabase: any) => {
  const rand = await getRandomId(supabase);
  try {
    if (rand !== null && rand !== undefined) {
      const { data, error } = await supabase
        .from("animals")
        .select("*")
        .eq("id", rand);
      if (error) console.error("Error getting Animal", error);
      return data;
    } else {
      console.error("Rand is undefined or null");
    }
  } catch (error) {
    console.error("Error getting data from DB:", error);
  }
};
const getUsers = async (supabase: any) => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) console.log("ERROR FETCHING USERS", error);
  return data;
};

export default async function homepage() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  const animal = await getAnimalOfTheDay(supabase);
  const users = await getUsers(supabase);
  return (
    <main>
      <Nav user={user} />
      {/*       <section>
        <AnimalOfTheDay data={animal[0]} />
      </section> */}
      <ProfileList profiles={users} />
    </main>
  );
}
