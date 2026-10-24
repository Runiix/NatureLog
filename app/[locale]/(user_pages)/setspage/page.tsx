import { CollectionsBookmark } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import SetCard from "@/app/[locale]/components/sets/SetCard";
import { EmptyState } from "@/app/[locale]/components/ui/EmptyState";
import { PageHeader } from "@/app/[locale]/components/ui/PageHeader";
import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import { getOwnedAnimals } from "@/app/[locale]/utils/compare-queries";
import { getUser } from "@/app/[locale]/utils/data";
import { setProgress } from "@/app/[locale]/utils/setProgress";
import { getSpeciesSets } from "@/app/[locale]/utils/sets";
import { createClient } from "@/utils/supabase/server";

export default async function SetsPage() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) redirect("/loginpage");

  // A set defines its own species, so the invertebrate setting does not apply.
  const [t, sets, owned] = await Promise.all([
    getTranslations("Sets"),
    getSpeciesSets(supabase),
    getOwnedAnimals(supabase, user.id, false),
  ]);

  return (
    <PageShell>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      {sets.length === 0 ? (
        <EmptyState icon={<CollectionsBookmark />} title={t("emptyTitle")} description={t("emptyText")} />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sets.map((set) => (
            <li key={set.listId}>
              <SetCard
                listId={set.listId}
                title={set.title}
                description={set.description}
                progress={setProgress(set.animalIds, owned)}
              />
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
