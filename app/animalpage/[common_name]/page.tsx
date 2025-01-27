import Nav from "@/app/components/Nav";
import Image from "next/image";
import { Height, Landscape } from "@mui/icons-material";
import { createClient } from "@/utils/supabase/server";

const getUser = async (supabase: any) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) console.error("Error fetching user", error);
  return user;
};

const getAnimalData = async (supabase: any, name: string) => {
  const birdName = decodeURIComponent(name);
  const { data, error } = await supabase
    .from("animals")
    .select("*")
    .eq("common_name", birdName);
  if (error) console.error("Error fetching animal Data");
  return data[0];
};

export default async function page(props: any) {
  const params = await props.params;
  const supabase = await createClient();
  const animalData = await getAnimalData(supabase, params.common_name);
  const user = await getUser(supabase);

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
            className="absolute w-full h-full object-cover"
          />
          <div className="absolute w-full h-1/2 object-cover top-1/2 m-auto bg-gradient-to-t from-gray-200/100 via-gray-200/0 to-gray-200/0"></div>

          {/*client*/}
          <div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        <div className="bg-gray-900 absolute w-2/3 h-1/2 m-auto top-[85%] rounded-lg shadow-xl shadow-slate-900">
          <div className="m-10 flex-col flex gap-8">
            <div className="flex justify-between w-full border-b pb-4 border-slate-400">
              <div className="flex flex-col gap-4 ">
                <h2 className="text-5xl">{animalData.common_name}</h2>
                <h3 className="text-2xl">{animalData.scientific_name}</h3>
                <h3 className="text-2xl flex items-center">
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
              <div className="flex flex-col gap-4">
                <h3 className="text-2xl">x% haben diese Art gesehen</h3>
                <div>
                  <div className="flex gap-5 ml-5">
                    <div className="rounded-full bg-green-600 p-1"></div>
                    <div className="rounded-full bg-gray-400 p-1"></div>
                    <div className="rounded-full bg-yellow-500 p-1"></div>
                    <div className="rounded-full bg-orange-600 p-1"></div>
                    <div className="rounded-full bg-red-600 p-1"></div>
                  </div>
                  <div className="text-2xl flex gap-2">
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
                    <h3>- {animalData.population_estimate}</h3>
                  </div>
                </div>

                <h3 className="text-2xl flex items-start gap-4 max-w-[40rem]">
                  <Landscape className="scale-150" />
                  {animalData.habitat}
                </h3>
              </div>
            </div>
            <div className="text-lg mx-16">
              <p>{animalData.description}</p>
            </div>
          </div>
        </div>
        {/*client*/}

        <div>RECENT IMAGE SILDER</div>
      </div>
    </div>
  );
}
//TODO: ENDANGERMENT STATUS COLOR STYLING
//      EXCHANGE x% at the end, maybe change it to number at the beginning???
