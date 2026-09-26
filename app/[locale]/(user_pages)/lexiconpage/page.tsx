import { AddCircleOutline } from "@mui/icons-material";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import getAnimals from "@/app/[locale]/actions/lexicon/getAnimals";
import { ButtonLink } from "@/app/[locale]/components/ui/Button";
import Search from "@/app/[locale]/components/general/Search";
import LexiconFilterList from "@/app/[locale]/components/lexicon/LexiconFilterList";
import LexiconGrid from "@/app/[locale]/components/lexicon/LexiconGrid";
import LexiconSort from "@/app/[locale]/components/lexicon/LexiconSort";
import { PageHeader } from "@/app/[locale]/components/ui/PageHeader";
import { ScrollToTop } from "@/app/[locale]/components/ui/ScrollToTop";
import { getHideInvertebrates, getUser } from "@/app/[locale]/utils/data";
import { pageMetadata } from "@/app/[locale]/utils/seo";
import { createClient } from "@/utils/supabase/server";

const PAGE_SIZE = 24;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return pageMetadata({ locale, path: "/lexiconpage", title: t("lexiconTitle"), description: t("lexiconDescription") });
}

export default async function LexiconPage({ searchParams }: Props) {
  const filters = Object.fromEntries(
    Object.entries(await searchParams).flatMap(([key, value]) =>
      typeof value === "string" ? [[key, value]] : [],
    ),
  );
  // Must equal the client's `useSearchParams().toString()`, so the grid knows
  // this first page is already the right one.
  const filterKey = new URLSearchParams(filters).toString();

  const supabase = await createClient();
  const [user, t, firstPage] = await Promise.all([
    getUser(supabase),
    getTranslations("Lexicon"),
    getAnimals(filters, 0, PAGE_SIZE),
  ]);
  const hideInvertebrates = await getHideInvertebrates(supabase, user);

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
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        subtitleDesktopOnly
        // Below `lg` the button lives in the filter dialog (LexiconFilterNav).
        actionsClassName="hidden lg:flex"
        actions={
          <ButtonLink href="/suggestanimalpage" variant="secondary" size="sm" icon={<AddCircleOutline />}>
            {t("suggestMissing")}
          </ButtonLink>
        }
      />
      <div className="flex items-center gap-2 sm:justify-between sm:gap-3">
        <Search placeholder="searchAnimal" debounceMs={600} className="min-w-0 flex-1 sm:w-72 sm:flex-none" />
        <LexiconSort />
      </div>
      <LexiconFilterList hideInvertebratesByDefault={hideInvertebrates} />
      <LexiconGrid
        key={filterKey}
        user={user}
        spottedList={spottedIds}
        initialAnimals={firstPage}
        initialKey={filterKey}
      />
      <ScrollToTop />
    </>
  );
}
