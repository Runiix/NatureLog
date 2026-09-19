import { getTranslations } from "next-intl/server";
import Search from "@/app/[locale]/components/general/Search";
import LexiconFilterList from "@/app/[locale]/components/lexicon/LexiconFilterList";
import LexiconGrid from "@/app/[locale]/components/lexicon/LexiconGrid";
import LexiconSort from "@/app/[locale]/components/lexicon/LexiconSort";
import { PageHeader } from "@/app/[locale]/components/ui/PageHeader";
import { ScrollToTop } from "@/app/[locale]/components/ui/ScrollToTop";
import { getUser } from "@/app/[locale]/utils/data";
import { createClient } from "@/utils/supabase/server";

export default async function LexiconPage() {
  const supabase = await createClient();
  const [user, t] = await Promise.all([getUser(supabase), getTranslations("Lexicon")]);

  // The favourite buttons need the viewer's spotted ids; one small query here
  // instead of a browser round-trip after the grid has rendered.
  let spottedIds: number[] = [];
  if (user) {
    const { data } = await supabase.from("spotted").select("animal_id").eq("user_id", user.id);
    spottedIds = (data ?? [])
      .map((row) => row.animal_id)
      .filter((id): id is number => id !== null);
  }

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="flex items-center gap-2 sm:justify-between sm:gap-3">
        <Search placeholder="searchAnimal" className="min-w-0 flex-1 sm:w-72 sm:flex-none" />
        <LexiconSort />
      </div>
      <LexiconFilterList />
      <LexiconGrid user={user} spottedList={spottedIds} />
      <ScrollToTop />
    </>
  );
}
