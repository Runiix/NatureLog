import Image from "next/image";
import Link from "next/link";
import Nav from "../components/Nav";
import HomeHero from "./assets/images/HomeHero.jpg";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import AnimalOfTheDay from "../components/AnimalOfTheDay";

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

export default async function homepage() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  const animal = await getAnimalOfTheDay(supabase);

  return (
    <main className="bg-gray-900 bg-opacity-50">
      <Nav user={user} />
      <section className="h-screen flex flex-col items-center justify-center gap-10"></section>
      <section>
        <AnimalOfTheDay data={animal[0]} />
      </section>
    </main>
  );
}
