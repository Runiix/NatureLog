import Nav from "../../components/Nav";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import LexiconGrid from "@/app/components/LexiconGrid";
import { createClient } from "@/utils/supabase/server";

const getUser = async (supabase: any) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) console.error("Error fetching user", error);
  return user;
};

const getSpottedList = async (supabase: any, userId: any) => {
  const { data, error } = await supabase
    .from("spotted")
    .select("animal_id")
    .eq("user_id", userId);
  if (error) console.error("Error getting spotted List", error);
  else {
    const spottedIds = data.map((animal: any) => animal.animal_id);
    return spottedIds;
  }
};
export default async function LexiconPage(params: any) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (user) {
    const userId = user.id;
    const spottedList = await getSpottedList(supabase, userId);
    return (
      <main className=" bg-gray-200">
        <Nav user={user} />
        <section className="flex flex-col items-center w-full">
          <h2 className="text-green-600 text-center text-6xl mt-24 mb-16">
            Arten-Lexikon{" "}
          </h2>
          <LexiconGrid
            filters={params.params}
            user={user}
            spottedList={spottedList}
          />
        </section>
      </main>
    );
  } else {
    const spottedList: [number] = [0];
    return (
      <main className=" bg-gray-200">
        <Nav user={user} />
        <section className="flex flex-col items-center w-full">
          <h2 className="text-green-600 text-center text-6xl mt-24 mb-16">
            Arten-Lexikon{" "}
          </h2>
          <LexiconGrid
            filters={params.params}
            user={user}
            spottedList={spottedList}
          />
        </section>
      </main>
    );
  }
}
