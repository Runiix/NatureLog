import Nav from "../components/Nav";
import { createClient } from "@/utils/supabase/server";
import AnimalOfTheDay from "../components/AnimalOfTheDay";
import ProfileList from "../components/ProfileList";
import AnimalRecognizer from "../components/AnimalRecognizer";

const getUser = async (supabase: any) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

const getRandomId = async (supabase: any) => {
  const { data, error } = await supabase.from("animals").select("id");
  if (error) console.error("Fehler bei Abfrage der Tier ID", error);
  const IdData = data.map((animal: any) => animal.id);
  const today = new Date().toISOString().split("T")[0];
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed += today.charCodeAt(i);
  }
  const index = seed % IdData.length;
  return IdData[index];
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
      return data[0];
    } else {
      console.error("Rand is undefined or null");
    }
  } catch (error) {
    console.error("Error getting data from DB:", error);
  }
};
const getUsers = async (supabase: any) => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) console.error("ERROR FETCHING USERS", error);
  return data;
};
async function fileExists(supabase: any, imageLink: string) {
  const { data, error } = await supabase.storage.from("animalImages").list("", {
    search: imageLink, // Checks if the file exists in the list
  });

  if (error) {
    console.error("Error listing files:", error);
    return false;
  }
  return data.some((file: { name: string }) => file.name === imageLink);
}

export default async function homepage() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  const animal = await getAnimalOfTheDay(supabase);
  const users = await getUsers(supabase);
  const Urlparts = animal.image_link.split("/animalImages/");
  const imageUrl = Urlparts[1];
  const imageExists = await fileExists(supabase, imageUrl);

  return (
    <main>
      <Nav user={user} />
      <section>
        {imageExists ? (
          <AnimalOfTheDay data={animal} imageUrl={animal.image_link} />
        ) : (
          <AnimalOfTheDay
            data={animal}
            imageUrl={
              "https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/animalImages/main/black.png"
            }
          />
        )}
      </section>
      <ProfileList profiles={users} />
      {/* <AnimalRecognizer /> */}
    </main>
  );
}
