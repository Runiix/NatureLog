import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import Nav from "@/app/components/Nav";
import Image from "next/image";
import Placeholder from "../../assets/images/Placeholder.jpg";
import { Height, Landscape } from "@mui/icons-material";
import { createClient } from "@/utils/supabase/server";

const getAnimalData = async (supabase: any, name: string) => {
  const birdName = decodeURIComponent(name);
  const { data, error } = await supabase
    .from("animals")
    .select("*")
    .eq("common_name", birdName);
  if (error) console.error("Error fetching animal Data");
  return data[0];
};

const getMainImage = async (supabase: any, name: string) => {
  const { data: categoryData, error: categoryError } = await supabase
    .from("animals")
    .select("category")
    .eq("common_name", name);
  if (categoryError) console.error("Error getting animal category");
  console.log(`/main/${categoryData[0].category}/${name}.webp`);

  const { data, error } = await supabase.storage
    .from("animalImages")
    .createSignedUrl(`main/${categoryData[0].category}/${name}.webp`, 60 * 60);
  if (error) {
    console.error("Error generating signed URL", error);
    return null;
  }

  console.log("signedUrl", data);
  return data;
};

export default async function page({ params }: any) {
  const supabase = await createClient();
  const animalData = await getAnimalData(supabase, params.common_name);

  const getUrl = () => {
    // Define a regular expression to match the characters ä, ö, ü, and ß
    const regex = /[äöüß]/g;
    // Replace the matched characters with '_'
    const Name = animalData.common_name.replace(regex, "_");
    console.log(animalData);
    if (animalData.category === "Säugetier") {
      const imageUrl = `https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/animalImages/main/Saeugetier/${Name}.jpg`;
      return imageUrl;
    } else {
      const imageUrl = `https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/animalImages/main/${animalData.category}/${Name}.jpg`;
      return imageUrl;
    }
  };
  const imageUrl = getUrl();
  /*   const mainImageUrl = await getMainImage(supabase, params.common_name);
   */ return (
    <div className="bg-gray-200 ">
      <Nav />
      <div className="h-screen flex flex-col items-center w-full">
        <div className="absolute w-full h-full object-cover ">
          <Image
            src={imageUrl}
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
