import { createClient } from "@/utils/supabase/server";
import CollectionAnimalGrid from "@/app/[locale]/components/collection/CollectionAnimalGrid";
import { getUser } from "@/app/[locale]/utils/data";
import { Lock } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import CollectionOverview from "@/app/[locale]/components/collection/CollectionOverview";
import NoDateFilter from "@/app/[locale]/components/collection/NoDateFilter";
import { EmptyState } from "@/app/[locale]/components/ui/EmptyState";
import { PageHeader } from "@/app/[locale]/components/ui/PageHeader";
import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import { ScrollToTop } from "@/app/[locale]/components/ui/ScrollToTop";
import Search from "@/app/[locale]/components/general/Search";
import ImageExistsFilter from "@/app/[locale]/components/collection/ImageExistsFilter";
import CollectionSort from "@/app/[locale]/components/collection/CollectionSort";
import type { TypedSupabaseClient } from "@/utils/supabase/types";
import { getProfileTarget } from "@/app/[locale]/utils/users";
import { canViewProfile } from "@/app/[locale]/utils/visibility";
import { notFound, redirect } from "next/navigation";
import { GENERA } from "@/app/[locale]/utils/lexiconFilters";
import { Suspense } from "react";


type SpottedRow = { animal_id: number; first_spotted_at: string | null };

const getSpottedRows = async (
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<SpottedRow[]> => {
  const { data, error } = await supabase
    .from("spotted")
    .select("animal_id, first_spotted_at")
    .eq("user_id", userId);
  if (error) {
    console.error("Error getting spotted List", error);
    return [];
  }
  return data.filter((row): row is SpottedRow => row.animal_id !== null);
};

/** Species first spotted per year, newest year first. Undated sightings are left out. */
const getYearCounts = (rows: SpottedRow[]) => {
  const counts = new Map<string, number>();
  for (const { first_spotted_at } of rows) {
    if (!first_spotted_at) continue;
    const year = first_spotted_at.slice(0, 4);
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  return [...counts]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => b.year.localeCompare(a.year));
};

const getCategoryCounts = async (
  supabase: TypedSupabaseClient,
  spottedIds: number[],
) => {
  if (spottedIds.length === 0) return [];
  const { data, error } = await supabase
    .from("animals")
    .select("category")
    .in("id", spottedIds)
    .order("common_name", { ascending: true });
  if (error) {
    console.error("Error getting Animals", error);
    return [];
  }
  return data;
};

const getAnimalCount = async (supabase: TypedSupabaseClient, genus: string) => {
  let query = supabase
    .from("animals")
    .select("id", { count: "exact", head: true });
  if (genus !== "all") query = query.eq("category", genus);

  const { count, error } = await query;
  if (error) {
    console.error("Error getting Animal Count", error);
    return 0;
  }
  return count ?? 0;
};

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ username: string; locale: string }>;
}) {
  const [supabase, { username }] = await Promise.all([createClient(), params]);
  const viewer = await getUser(supabase);
  if (!viewer) redirect("/loginpage");

  const target = await getProfileTarget(supabase, username);
  if (!target) notFound();

  const t = await getTranslations("Collection");
  const isOwner = viewer.id === target.id;
  const viewable = isOwner || (await canViewProfile(supabase, viewer.id, target.id));

  const header = (
    <PageHeader
      title={isOwner ? t("title") : t("titleOf", { name: target.displayName })}
      subtitle={
        isOwner ? t("subtitleOwner") : t("subtitleVisitor", { name: target.displayName })
      }
      subtitleDesktopOnly
      backHref={isOwner ? undefined : `/profilepage/${target.displayName}`}
      backLabel={t("backToProfile")}
    />
  );

  if (!viewable) {
    return (
      <PageShell>
        {header}
        <EmptyState
          icon={<Lock />}
          title={t("private")}
          description={t("privateText", { name: target.displayName })}
          className="bg-surface"
        />
      </PageShell>
    );
  }

  const [counts, ownerRows, viewerRows] = await Promise.all([
    Promise.all(
      [...GENERA, "all"].map(async (genus) => [genus, await getAnimalCount(supabase, genus)] as const),
    ).then((entries): Record<string, number> => Object.fromEntries(entries)),
    getSpottedRows(supabase, target.id),
    isOwner ? Promise.resolve(null) : getSpottedRows(supabase, viewer.id),
  ]);
  const ownerSpotted = ownerRows.map((row) => row.animal_id);
  const viewerSpotted = viewerRows?.map((row) => row.animal_id) ?? null;
  const categoryCounts = (await getCategoryCounts(supabase, ownerSpotted)).filter(
    (row): row is { category: string } => row.category !== null,
  );

  return (
    <PageShell>
      {header}
      <Suspense>
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex min-w-[12rem] flex-1 items-center gap-2 sm:flex-none sm:gap-3">
            <Search placeholder="searchAnimal" debounceMs={600} className="min-w-0 flex-1 sm:w-72 sm:flex-none" />
            <ImageExistsFilter />
            <NoDateFilter />
          </div>
          {/* Phones: sort gets its own full-width row. */}
          <div className="w-full sm:ml-auto sm:w-auto">
            <CollectionSort />
          </div>
        </div>
        <CollectionOverview
          counts={counts}
          categoryCounts={categoryCounts}
          yearCounts={getYearCounts(ownerRows)}
        />
      </div>
      <CollectionAnimalGrid
        user={viewer}
        ownerId={target.id}
        isOwner={isOwner}
        viewerSpotted={viewerSpotted ?? ownerSpotted}
      />
      </Suspense>
      <ScrollToTop />
    </PageShell>
  );
}
