import { createClient } from "@/utils/supabase/server";
import CollectionAnimalGrid from "@/app/[locale]/components/collection/CollectionAnimalGrid";
import { getUser } from "@/app/[locale]/utils/data";
import { Lock } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import GenusFilter from "@/app/[locale]/components/collection/GenusFilter";
import { EmptyState } from "@/app/[locale]/components/ui/EmptyState";
import { PageHeader } from "@/app/[locale]/components/ui/PageHeader";
import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import { ScrollToTop } from "@/app/[locale]/components/ui/ScrollToTop";
import Search from "@/app/[locale]/components/general/Search";
import ImageExistsFilter from "@/app/[locale]/components/collection/ImageExistsFilter";
import type { TypedSupabaseClient } from "@/utils/supabase/types";
import { getProfileTarget } from "@/app/[locale]/utils/users";
import { canViewProfile } from "@/app/[locale]/utils/visibility";
import { notFound, redirect } from "next/navigation";


const getSpottedIds = async (
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<number[]> => {
  const { data, error } = await supabase
    .from("spotted")
    .select("animal_id")
    .eq("user_id", userId);
  if (error) {
    console.error("Error getting spotted List", error);
    return [];
  }
  return data
    .map((row) => row.animal_id)
    .filter((id): id is number => id !== null);
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
  const supabase = await createClient();
  const { username } = await params;
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

  const [counts, ownerSpotted, viewerSpotted] = await Promise.all([
    Promise.all(
      ["Säugetier", "Vogel", "Reptil", "Amphibie", "Insekt", "Arachnoid", "all"].map((genus) =>
        getAnimalCount(supabase, genus),
      ),
    ),
    getSpottedIds(supabase, target.id),
    isOwner ? Promise.resolve(null) : getSpottedIds(supabase, viewer.id),
  ]);
  const categoryCounts = (await getCategoryCounts(supabase, ownerSpotted)).filter(
    (row): row is { category: string } => row.category !== null,
  );

  return (
    <PageShell>
      {header}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <Search placeholder="searchAnimal" className="min-w-0 flex-1 sm:w-72 sm:flex-none" />
          <ImageExistsFilter />
        </div>
        <GenusFilter counts={counts} categoryCounts={categoryCounts} />
      </div>
      <CollectionAnimalGrid
        user={viewer}
        ownerId={target.id}
        isOwner={isOwner}
        viewerSpotted={viewerSpotted ?? ownerSpotted}
      />
      <ScrollToTop />
    </PageShell>
  );
}
