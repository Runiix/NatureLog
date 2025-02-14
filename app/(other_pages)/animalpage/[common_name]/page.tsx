import Nav from "@/app/components/general/Nav";
import Image from "next/image";
import { Height, Landscape } from "@mui/icons-material";
import { createClient } from "@/utils/supabase/server";
import FavoriteButton from "@/app/components/general/FavoriteButton";
import { SupabaseClient, User } from "@supabase/supabase-js";

const getUser = async (supabase: SupabaseClient) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return user;
};

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
      const spottedIds: number[] = data.map((animal: any) => animal.animal_id);
      return spottedIds;
    }
  }
  return [];
};

export default async function page(props: any) {
  const params = await props.params;
  const supabase = await createClient();
  const user = await getUser(supabase);
  const animalData = await getAnimalData(supabase, params.common_name);
  const spottedList = user ? await getSpottedList(supabase, user) : [];

  return (
    <div className="bg-gray-200 ">
      <Nav user={user} />
      <div className="h-screen flex flex-col items-center w-full">
        <div className="absolute w-full h-full object-cover ">
          <Image
            src={animalData.image_link}
            alt="animal Banner"
            width={2000}
            height={2000}
            className="absolute w-full h-1/2 sm:h-full object-cover"
            priority
          />
          <div className="absolute w-full h-1/2 object-cover top-1/2 m-auto bg-gradient-to-t from-gray-200/100 via-gray-200/0 to-gray-200/0"></div>
          <FavoriteButton
            user={user}
            id={animalData.id}
            spottedList={spottedList}
            styles="absolute right-7
             md:right-36 xl:right-[20%] top-[38%] sm:top-[78%] z-50 scale-150 sm:scale-[2]"
          />
        </div>
        <div className="bg-gray-900 absolute  lg:w-10/12 xl:w-2/3 sm:h-1/2 m-auto top-[45%] sm:top-[85%] rounded-lg shadow-xl shadow-slate-900">
          <div className="m-10 flex-col flex gap-8">
            <div className="flex sm:flex-row flex-col justify-between w-full border-b pb-4 border-slate-400 gap-4 sm:gap-0">
              <div className="flex flex-col gap-4 ">
                <div>
                  <h2 className="text-3xl lg:text-4xl">
                    {animalData.common_name}
                  </h2>
                  <h3 className="text-xl lg:text-2xl">
                    {animalData.scientific_name}
                  </h3>
                </div>
                <h3 className="text-xl lg:text-2xl flex items-center">
                  <Height className="scale-150" />
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
              </div>
              <div className="flex flex-col sm:items-end gap-4">
                <h3 className="text-xl">x% haben diese Art gesehen</h3>
                <div>
                  <div className="flex gap-5 ml-5">
                    <div className="rounded-full bg-green-600 p-1"></div>
                    <div className="rounded-full bg-gray-400 p-1"></div>
                    <div className="rounded-full bg-yellow-500 p-1"></div>
                    <div className="rounded-full bg-orange-600 p-1"></div>
                    <div className="rounded-full bg-red-600 p-1"></div>
                  </div>
                  <div className="text-xl flex flex-col md:flex-row gap-2">
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
                          : animalData.endangerment_status === "Stark gefährdet"
                          ? "text-orange-700"
                          : animalData.endangerment_status ===
                            "Vom Aussterben bedroht"
                          ? "text-red-600"
                          : "text-white"
                      }
                    >
                      {animalData.endangerment_status}{" "}
                    </h3>
                    <h3>{animalData.population_estimate}</h3>
                  </div>
                </div>

                <h3 className="text-xl flex items-start gap-4 max-w-[40rem]">
                  <Landscape className="scale-150" />
                  {animalData.habitat}
                </h3>
              </div>
            </div>
            <div className="text-lg sm:mx-16">
              <p>{animalData.description}</p>
            </div>
          </div>
        </div>
        <div>RECENT IMAGE SILDER</div>
      </div>
    </div>
  );
}
