import LexiconGrid from "@/app/components/lexicon/LexiconGrid";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { getUser } from "@/app/utils/data";

const getSpottedList = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from("spotted")
    .select("animal_id")
    .eq("user_id", userId);
  if (error) console.error("Error getting spotted List", error);
  else {
    const spottedIds: number[] = data.map((animal: any) => animal.animal_id);
    return spottedIds;
  }
  return [];
};
async function getAnimalImageList(supabase: SupabaseClient, genus: string) {
  const { data, error } = await supabase.storage
    .from("animalImages")
    .list(`main/${genus}/`, {
      limit: 400,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });
  if (error) console.error("Error fetching animal images", error);
  if (data === null) return [];

  const filteredData = data.filter(
    (item: { name: string }) => item.name !== ".emptyFolderPlaceholder"
  );
  const listData: string[] = filteredData.map((animal) => animal.name);
  return listData;
}

export default async function LexiconPage() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  const [
    mammalImages,
    birdImages,
    amphibiaImages,
    reptileImages,
    spiderImages,
    insectImages,
  ] = await Promise.all([
    getAnimalImageList(supabase, "Saeugetier"),
    getAnimalImageList(supabase, "Vogel"),
    getAnimalImageList(supabase, "Amphibie"),
    getAnimalImageList(supabase, "Reptil"),
    getAnimalImageList(supabase, "Arachnoid"),
    getAnimalImageList(supabase, "Insekt"),
  ]);

  const animalImageList = mammalImages.concat(
    birdImages,
    amphibiaImages,
    reptileImages,
    spiderImages,
    insectImages
  );
  if (user) {
    const userId = user.id;
    const spottedList = await getSpottedList(supabase, userId);
    return (
      <div className=" bg-gray-200 mt-16">
        <section className="flex flex-col items-center w-full">
          <h2 className="text-green-600 text-center text-2xl sm:text-6xl sm:mt-24 sm:mb-2">
            Arten-Lexikon{" "}
          </h2>
          <LexiconGrid
            user={user}
            spottedList={spottedList}
            animalImageList={animalImageList}
          />
        </section>
      </div>
    );
  } else {
    const spottedList: number[] = [0];
    return (
      <div className=" bg-gray-200">
        <section className="flex flex-col items-center w-full">
          <h2 className="text-green-600 text-center text-2xl sm:text-6xl sm:mt-24 sm:mb-2">
            Arten-Lexikon{" "}
          </h2>
          <LexiconGrid
            user={user}
            spottedList={spottedList}
            animalImageList={animalImageList}
          />
        </section>
      </div>
    );
  }
}
