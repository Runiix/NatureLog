import { CameraAlt, Pets, Visibility } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { SpeciesCard } from "@/app/[locale]/components/animals/SpeciesCard";
import { SetBadges, SetProgressBars } from "@/app/[locale]/components/sets/SetCard";
import { Card } from "@/app/[locale]/components/ui/Card";
import { EmptyState } from "@/app/[locale]/components/ui/EmptyState";
import { PageHeader } from "@/app/[locale]/components/ui/PageHeader";
import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import { getOwnedAnimals } from "@/app/[locale]/utils/compare-queries";
import { getUser } from "@/app/[locale]/utils/data";
import { setProgress } from "@/app/[locale]/utils/setProgress";
import { getSpeciesSets } from "@/app/[locale]/utils/sets";
import { createClient } from "@/utils/supabase/server";

export default async function SetPage({ params }: { params: Promise<{ listId: string; locale: string }> }) {
  const [supabase, { listId }] = await Promise.all([createClient(), params]);
  const user = await getUser(supabase);
  if (!user) redirect("/loginpage");

  const [t, sets, owned] = await Promise.all([
    getTranslations("Sets"),
    getSpeciesSets(supabase),
    getOwnedAnimals(supabase, user.id, false),
  ]);
  const set = sets.find((candidate) => candidate.listId === listId);
  if (!set) notFound();

  const { data: animals, error } = set.animalIds.length
    ? await supabase.from("animals").select("id, common_name, lexicon_link").in("id", set.animalIds)
    : { data: [], error: null };
  if (error) console.error("Error loading set animals", error);

  const photos = new Map(owned.map((row) => [row.animalId, row.hasPhoto]));
  const progress = setProgress(set.animalIds, owned);
  const sorted = [...(animals ?? [])].sort((a, b) => a.common_name.localeCompare(b.common_name, "de"));

  return (
    <PageShell>
      <PageHeader
        title={set.title || t("untitled")}
        subtitle={set.description ?? undefined}
        backHref="/setspage"
        backLabel={t("allSets")}
      />
      <Card className="flex flex-col gap-3 sm:max-w-md">
        <SetBadges progress={progress} />
        <SetProgressBars progress={progress} />
      </Card>
      {sorted.length === 0 ? (
        <EmptyState icon={<Pets />} title={t("emptySetTitle")} />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {sorted.map((animal) => {
            const status = photos.get(animal.id) ? "photographed" : photos.has(animal.id) ? "spotted" : "missing";
            return (
              <li key={animal.id}>
                <SpeciesCard
                  commonName={animal.common_name}
                  lexiconLink={animal.lexicon_link}
                  dimmed={status === "missing"}
                  footer={
                    <>
                      {status === "photographed" && <CameraAlt sx={{ fontSize: 14 }} aria-hidden />}
                      {status === "spotted" && <Visibility sx={{ fontSize: 14 }} aria-hidden />}
                      {t(`status.${status}`)}
                    </>
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
    </PageShell>
  );
}
