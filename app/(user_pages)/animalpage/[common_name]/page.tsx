import {
  CalendarMonth,
  Compare,
  Female,
  Height,
  Landscape,
  Male,
  Numbers,
} from "@mui/icons-material";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient, User } from "@supabase/supabase-js";
import AnimalBanner from "@/app/components/animals/AnimalBanner";
import FavoriteFunctionality from "@/app/components/general/FavoriteFunctionality";
import Link from "next/link";
import BackButton from "@/app/components/general/BackButton";
import { getUser } from "@/app/utils/data";
import RecentAnimalImageUploads from "@/app/components/animals/RecentAnimalImageUploads";

const getAnimalData = async (supabase: SupabaseClient, name: string) => {
  const birdName = decodeURIComponent(name);
  const { data, error } = await supabase
    .from("animals")
    .select("*")
    .eq("common_name", birdName);
  if (error) console.error("Error fetching animal Data");
  if (data) return data[0];
};
const getSpottedList = async (supabase: SupabaseClient, user: User) => {
  if (user) {
    const { data, error } = await supabase
      .from("spotted")
      .select("animal_id")
      .eq("user_id", user.id);
    if (error) console.error("Error getting spotted List", error);
    else {
      const spottedIds: number[] = data.map(
        (animal: { animal_id: number }) => animal.animal_id
      );
      return spottedIds;
    }
  }
  return [];
};
const getSpottedCount = async (supabase: SupabaseClient, animalId: string) => {
  const { data, error } = await supabase
    .from("spotted")
    .select("animal_id")
    .eq("animal_id", animalId);
  if (error) console.error("Error getting animal count", error);
  if (data) return data.length;
  return 0;
};
const getRecentImageUsers = async (
  supabase: SupabaseClient,
  animalId: string
) => {
  const { data, error } = await supabase
    .from("spotted")
    .select("user_id")
    .eq("animal_id", animalId)
    .eq("image", true)
    .order("image_updated_at", { ascending: false })
    .limit(5);
  if (error) {
    console.error("Error getting recent images user list", error);
    return [];
  }
  const idArray = data.map((user) => user.user_id);
  const { data: nameData, error: nameError } = await supabase
    .from("users")
    .select("id, display_name")
    .in("id", idArray);
  if (nameError) {
    console.error("Error getting usernames", error);
    return [];
  }
  return nameData;
};

export default async function AnimalPage(params: any) {
  const dynamicParams = await params.params;
  const supabase = await createClient();
  const user = await getUser(supabase);
  const animalData = await getAnimalData(supabase, dynamicParams.common_name);
  const spottedList = user ? await getSpottedList(supabase, user) : [];
  const animalCount = await getSpottedCount(supabase, animalData.id);
  const userList = await getRecentImageUsers(supabase, animalData.id);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full relative">
        <BackButton />

        {animalData && (
          <AnimalBanner
            image={animalData.image_link}
            credit_link={animalData.image_credit_link}
            credit_text={animalData.image_credit_text}
            license_link={animalData.image_license_link}
            license_text={animalData.image_license_text}
          />
        )}
        <div className="shadow-black shadow-lg bg-gradient-to-br border-gray-200 border from-gray-900 to-70% transition-all duration-200 to-gray-950 rounded-lg py-2 w-[98%] lg:w-11/12 xl:w-10/12 mx-auto mb-20">
          <div className=" m-4 sm:m-10 flex-col flex gap-8">
            <div className="flex flex-col lg:flex-row justify-between w-full border-b pb-4 border-slate-400 gap-4 sm:gap-0">
              <div className="flex flex-col gap-4 ">
                <div>
                  <div className="flex items-center gap-2 mr-2 lg:gap-8">
                    <h2 className=" text-2xl md:text-3xl lg:text-4xl">
                      {animalData.common_name}
                    </h2>
                    {user && (
                      <FavoriteFunctionality
                        user={user}
                        id={animalData.id}
                        spottedList={spottedList}
                        buttonStyles=" scale-125 sm:scale-[2] "
                        modalStyles=""
                      />
                    )}
                  </div>

                  <h3 className="text-lg text-gray-300 md:text-xl lg:text-2xl">
                    {animalData.scientific_name}
                  </h3>
                  <h3 className="text-lg text-gray-300 md:text-xl lg:text-2xl mt-4">
                    {animalData.taxonomic_order}
                  </h3>
                  <h3 className="md:text-xl text-wrap flex gap-1">
                    <p className="text-green-600">{animalCount}</p> Mitglieder
                    haben diese Art gesehen
                  </h3>
                  <div className="my-4">
                    <div className="flex gap-5 ml-2">
                      <div className="rounded-full bg-green-600 p-1"></div>
                      <div className="rounded-full bg-gray-400 p-1"></div>
                      <div className="rounded-full bg-yellow-500 p-1"></div>
                      <div className="rounded-full bg-orange-600 p-1"></div>
                      <div className="rounded-full bg-red-600 p-1"></div>
                    </div>
                    <div className="md:text-xl flex flex-col sm:flex-row gap-2">
                      <h3
                        className={
                          animalData.endangerment_status === "Nicht gefährdet"
                            ? "text-green-600"
                            : animalData.endangerment_status === "Extrem selten"
                            ? "text-gray-400"
                            : animalData.endangerment_status === "Vorwarnliste"
                            ? "text-yellow-500"
                            : animalData.endangerment_status === "Gefährdet"
                            ? "text-orange-500"
                            : animalData.endangerment_status ===
                              "Stark gefährdet"
                            ? "text-orange-700"
                            : animalData.endangerment_status ===
                              "Vom Aussterben bedroht"
                            ? "text-red-600"
                            : "text-white"
                        }
                      >
                        {animalData.endangerment_status}{" "}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 md:text-xl text-nowrap">
                <h3 className="text-lg md:text-xl lg:text-2xl flex gap-2 items-center -ml-1">
                  <div className="flex items-center">
                    <Height className="md:scale-150" />
                    <h3> Größe:</h3>
                  </div>

                  <h3 className="text-green-600 ">
                    {animalData.size_to >= 100
                      ? `${animalData.size_from / 100}  -  ${
                          animalData.size_to / 100
                        } m`
                      : animalData.size_to > 0
                      ? `${animalData.size_from}  -  ${animalData.size_to} cm`
                      : `${animalData.size_from * 100}  -  ${
                          animalData.size_to * 100
                        } mm`}
                  </h3>
                </h3>
                <div className="flex md:items-center flex-col md:flex-row gap-1">
                  <div className="flex">
                    <Numbers />
                    <h3>Population:</h3>
                  </div>
                  <h3 className="text-sm md:text-base text-green-600">
                    {animalData.population_estimate}
                  </h3>
                </div>
                {animalData.similar_animals && (
                  <div className="flex flex-col 2xl:flex-row md:gap-2 2xl:items-start ">
                    <div className="flex gap-1 md:gap-2 items-center">
                      <Compare />
                      <h3 className="md:text-xl">Ähnliche Arten:</h3>
                    </div>
                    <div className="flex gap-1 md:gap-2 flex-wrap">
                      {animalData.similar_animals.map(
                        (animal: string, index: number) => (
                          <Link
                            className="text-green-600 hover:underline  text-sm md:text-base"
                            key={index}
                            href={`/animalpage/${animal}`}
                          >
                            {animal}
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col 2xl:flex-row md:gap-2 2xl:items-center">
                  <div className="flex gap-1 md:gap-2 items-center">
                    <CalendarMonth />

                    <h3> In Deutschland zu sehen:</h3>
                  </div>
                  <h3 className="text-green-600 text-wrap  text-sm md:text-base ">
                    {animalData.presence_time}
                  </h3>
                </div>
                {animalData.habitat && (
                  <div className="flex flex-col 2xl:flex-row md:gap-2 2xl:items-center">
                    <div className="flex gap-1 md:gap-2 items-center md:text-xl">
                      <Landscape className="md:scale-150 -mt-1" />
                      <h3>Habitate:</h3>
                    </div>
                    <h3 className="text-green-600 text-sm md:text-base text-wrap">
                      {animalData.habitat}
                    </h3>
                  </div>
                )}
                {animalData.sexual_dimorphism !== "Nein" && (
                  <div className="flex flex-col md:gap-2">
                    <div className="flex gap-1 md:gap-2 items-center md:text-xl">
                      <Male className="md:scale-150 -mt-1" />
                      <Female className="md:scale-150 -mt-1" />
                      <h3>Geschlechtsdemorphismus:</h3>
                    </div>
                    <h3 className="text-green-600 text-wrap md:max-w-[30rem]  text-sm md:text-base ">
                      {animalData.sexual_dimorphism}
                    </h3>
                  </div>
                )}
              </div>
            </div>
            <div className=" text-sm md:text-lg md:mx-16 text-wrap">
              <p>{animalData.description}</p>
            </div>
            <RecentAnimalImageUploads
              data={userList}
              animalName={animalData.common_name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
