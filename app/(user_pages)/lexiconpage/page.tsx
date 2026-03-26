import LexiconGrid from "@/app/components/lexicon/LexiconGrid";
import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/app/utils/data";
import Search from "@/app/components/general/Search";

export default async function LexiconPage() {
  const supabase = await createClient();
  const user = await getUser(supabase);

  return (
    <section className=" h-[calc(100vh-2.5rem)] sm:h-[calc(100vh-4rem)] flex flex-col items-center w-full">
      <div className="flex w-9/12 mx-auto shadow-md p-4 items-center justify-between rounded-lg  bg-gradient-to-br  from-gray-200 to-70% transition-all duration-200 to-gray-300">
        <h2 className="text-green-600 text-center text-2xl sm:text-4xl sm:mb-2">
          Arten-Lexikon{" "}
        </h2>
        <Search placeholder="Tier suchen" />
      </div>
      {/* Pass an empty spotted list; client will populate for logged-in users */}
      <div className="overflow-auto w-full pb-10">
        <LexiconGrid user={user} spottedList={[]} />
      </div>
    </section>
  );
}
