import LexiconGrid from "@/app/[locale]/components/lexicon/LexiconGrid";
import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/app/[locale]/utils/data";
import Search from "@/app/[locale]/components/general/Search";

export default async function LexiconPage() {
  const supabase = await createClient();
  const user = await getUser(supabase);

  return (
    <section className=" h-[calc(100vh-2.5rem)] sm:h-[calc(100vh-4rem)] flex flex-col items-center w-full">
      <div className="flex items-center justify-between w-full max-w-[1200px] mx-auto mt-4 shadow-lg shadow-gray-400 p-4 rounded-lg">
        <h2 className="text-green-600 text-center text-2xl xl:text-5xl">
          Lexikon
        </h2>{" "}
        <Search placeholder="searchAnimal" />
      </div>
      {/* Pass an empty spotted list; client will populate for logged-in users */}
      <div className="overflow-y-auto  overflow-x-hidden w-full pb-10">
        <LexiconGrid user={user} spottedList={[]} />
      </div>
    </section>
  );
}
