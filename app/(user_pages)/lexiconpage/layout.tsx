import LexiconFilter from "@/app/components/lexicon/LexiconFilter";
import LexiconFilterNav from "@/app/components/lexicon/LexiconFilterNav";
import LexiconSort from "@/app/components/lexicon/LexiconSort";
import { getUser } from "@/app/utils/data";
import { createClient } from "@/utils/supabase/server";
import { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  const user = await getUser(supabase);

  return (
    <div className="flex w-full">
      <LexiconFilterNav>
        <section className="pt-8 pb-4 mb-4 border-b border-gray-950 ">
          <h2 className="text-black">Sortierung</h2>
          <LexiconSort />
        </section>
        <LexiconFilter user={user} />
      </LexiconFilterNav>
      <section className="mx-auto w-full">{children}</section>
    </div>
  );
}
