export const dynamic = "force-dynamic";

import { ImageSearch as ImageSearchIcon, Link as LinkIcon, Quiz } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import getLastSpottedAnimals from "@/app/[locale]/actions/home/getLastSpottedAnimals";
import AnimalOfTheDay from "@/app/[locale]/components/home/AnimalOfTheDay";
import AnimalQuiz from "@/app/[locale]/components/home/AnimalQuiz";
import DailyChallenge from "@/app/[locale]/components/home/DailyChallenge";
import ImageSearch from "@/app/[locale]/components/home/ImageSearch";
import RecentUploads from "@/app/[locale]/components/home/RecentUploads";
import SightingStats, { type SpottingStats } from "@/app/[locale]/components/home/SightingStats";
import UseFullLinks from "@/app/[locale]/components/home/UseFullLinks";
import FollowFeed from "@/app/[locale]/components/social/FollowFeed";
import { Card, CardTitle } from "@/app/[locale]/components/ui/Card";
import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import { getUser } from "@/app/[locale]/utils/data";
import { seededIndex } from "@/app/[locale]/utils/seededIndex";
import { createClient } from "@/utils/supabase/server";
import type { Tables, TypedSupabaseClient } from "@/utils/supabase/types";

/**
 * Animal of the day and of the month, from a single id query. The day seed
 * used to be `toISOString().split("-")[2]` — "18T10:22:33.000Z" — which
 * includes the time, so the "animal of the day" changed on every request.
 */
async function getFeaturedAnimals(supabase: TypedSupabaseClient) {
  const { data: ids, error } = await supabase
    .from("animals")
    .select("id")
    .not("lexicon_link", "is", null)
    .order("id");
  if (error || !ids || ids.length === 0) {
    console.error("Error loading animal ids", error);
    return { day: null, month: null };
  }

  const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
  const dayId = ids[seededIndex(today, ids.length)].id;
  const monthId = ids[seededIndex(`month:${today.slice(0, 7)}`, ids.length)].id;

  const { data } = await supabase.from("animals").select("*").in("id", [dayId, monthId]);
  const byId = new Map((data ?? []).map((animal) => [animal.id, animal]));
  return {
    day: byId.get(dayId) ?? null,
    month: byId.get(monthId) ?? null,
  } satisfies Record<string, Tables<"animals"> | null>;
}

/** Sighting totals for the stats row, computed from one query over the user's rows. */
async function getSpottingStats(supabase: TypedSupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("spotted")
    .select("first_spotted_at, image")
    .eq("user_id", userId);
  if (error) console.error("Error loading spotting stats", error);

  const rows = data ?? [];
  const now = new Date().toISOString();
  const month = now.slice(0, 7); // yyyy-mm
  const year = now.slice(0, 4);
  return {
    total: rows.length,
    thisMonth: rows.filter((row) => row.first_spotted_at?.startsWith(month)).length,
    thisYear: rows.filter((row) => row.first_spotted_at?.startsWith(year)).length,
    withPhoto: rows.filter((row) => row.image === true).length,
  } satisfies SpottingStats;
}

export default async function HomePage() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) redirect("/loginpage");
  const name = user.user_metadata.displayName as string;

  const [t, featured, recent, stats] = await Promise.all([
    getTranslations("Home"),
    getFeaturedAnimals(supabase),
    getLastSpottedAnimals(),
    getSpottingStats(supabase, user.id),
  ]);

  return (
    <PageShell className="max-w-7xl">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("greeting", { name })}
        </h1>
        <p className="text-fg-muted">{t("subtitle", { count: stats.total })}</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid auto-rows-min gap-4 md:grid-cols-6">
          {featured.day && (
            <div className="md:col-span-4 md:row-span-2">
              <AnimalOfTheDay data={featured.day} title={t("animalOfTheDay")} size="lg" />
            </div>
          )}
          {featured.month && (
            <div className="md:col-span-2">
              <AnimalOfTheDay data={featured.month} title={t("animalOfTheMonth")} />
            </div>
          )}
          <Card className="md:col-span-2">
            <DailyChallenge />
          </Card>

          <Card className="flex flex-col gap-3 md:col-span-3">
            <CardTitle as="h2">{t("recent.title")}</CardTitle>
            <RecentUploads data={recent} collectionHref={`/collectionpage/${name}`} />
            <SightingStats stats={stats} />
          </Card>
          <Card className="flex flex-col gap-3 md:col-span-3">
            <CardTitle as="h2" className="flex items-center gap-2">
              <Quiz fontSize="small" aria-hidden className="text-accent-text" />
              {t("quiz.title")}
            </CardTitle>
            <AnimalQuiz />
          </Card>

          <Card className="flex flex-col gap-3 md:col-span-3">
            <CardTitle as="h2" className="flex items-center gap-2">
              <ImageSearchIcon fontSize="small" aria-hidden className="text-accent-text" />
              {t("imageSearch.title")}
            </CardTitle>
            <ImageSearch />
          </Card>
          <Card className="flex flex-col gap-3 md:col-span-3">
            <CardTitle as="h2" className="flex items-center gap-2">
              <LinkIcon fontSize="small" aria-hidden className="text-accent-text" />
              {t("links.title")}
            </CardTitle>
            <UseFullLinks />
          </Card>
        </div>

        <aside aria-labelledby="home-feed">
          <Card className="flex flex-col gap-3 xl:sticky xl:top-24 xl:max-h-[calc(100svh-7rem)] xl:overflow-y-auto">
            <CardTitle as="h2" id="home-feed">
              {t("feed")}
            </CardTitle>
            <FollowFeed socialHref={`/socialpage/${name}`} />
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}
