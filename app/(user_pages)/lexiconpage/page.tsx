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
    const spottedIds: number[] = data.map(
      (animal: { animal_id: number }) => animal.animal_id
    );
    return spottedIds;
  }
  return [];
};

export default async function LexiconPage() {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (user) {
    const userId = user.id;
    const spottedList = await getSpottedList(supabase, userId);
    return (
      <div className=" bg-gray-200">
        <section className="flex flex-col items-center w-full">
          <h2 className="text-green-600 text-center text-2xl sm:text-6xl mt-14 sm:mt-20 sm:mb-2">
            Arten-Lexikon{" "}
          </h2>
          <LexiconGrid user={user} spottedList={spottedList} />
        </section>
      </div>
    );
  } else {
    const spottedList: number[] = [0];
    return (
      <div className=" bg-gray-200">
        <section className="flex flex-col items-center w-full">
          <h2 className="text-green-600 text-center text-2xl sm:text-6xl mt-14 sm:mt-20 sm:mb-2">
            Arten-Lexikon{" "}
          </h2>
          <LexiconGrid user={user} spottedList={spottedList} />
        </section>
      </div>
    );
  }
}
