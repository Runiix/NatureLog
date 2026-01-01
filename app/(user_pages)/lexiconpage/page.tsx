import LexiconGrid from "@/app/components/lexicon/LexiconGrid";
import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/app/utils/data";

export default async function LexiconPage() {
  const supabase = await createClient();
  const user = await getUser(supabase);

  return (
    <div className=" bg-gray-200">
      <section className="flex flex-col items-center w-full">
        <h2 className="text-green-600 text-center text-2xl sm:text-6xl mt-8 sm:mb-2">
          Arten-Lexikon{" "}
        </h2>
        {/* Pass an empty spotted list; client will populate for logged-in users */}
        <LexiconGrid user={user} spottedList={[]} />
      </section>
    </div>
  );
}
