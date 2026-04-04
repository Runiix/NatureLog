"use server";

import { createClient } from "@/utils/supabase/server";

export default async function getQuizAnimals() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("animals").select("id");
  if (error) console.error("Fehler bei Abfrage der Tier ID", error);
  const IdData = data && data.map((animal: { id: number }) => animal.id);

  const rand = IdData?.sort(() => 0.5 - Math.random()).slice(0, 4);

  if (rand !== null && rand !== undefined) {
    const { data, error } = await supabase
      .from("animals")
      .select("*")
      .in("id", rand);
    if (error) console.error("Error getting Animal", error);
    if (data) return data;
  } else {
    console.error("Rand is undefined or null");
    return [];
  }
}
