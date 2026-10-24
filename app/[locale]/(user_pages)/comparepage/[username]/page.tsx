import { Groups, Lock } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import CompareGrid, { type CompareGridAnimal } from "@/app/[locale]/components/compare/CompareGrid";
import { ButtonLink } from "@/app/[locale]/components/ui/Button";
import { EmptyState } from "@/app/[locale]/components/ui/EmptyState";
import { PageHeader } from "@/app/[locale]/components/ui/PageHeader";
import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import { getOwnedAnimals } from "@/app/[locale]/utils/compare-queries";
import { compareCollections } from "@/app/[locale]/utils/compareCollections";
import { cn } from "@/app/[locale]/utils/cn";
import { getHideInvertebrates, getUser } from "@/app/[locale]/utils/data";
import { getProfileTarget } from "@/app/[locale]/utils/users";
import { canViewProfile } from "@/app/[locale]/utils/visibility";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/utils/supabase/server";

const TABS = ["theirs", "photos", "both", "mine"] as const;
type Tab = (typeof TABS)[number];

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string; locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [supabase, { username }, { tab: rawTab }] = await Promise.all([createClient(), params, searchParams]);

  const viewer = await getUser(supabase);
  if (!viewer) redirect("/loginpage");

  const target = await getProfileTarget(supabase, username);
  if (!target) notFound();
  if (target.id === viewer.id) redirect(`/profilepage/${target.displayName}`);

  const t = await getTranslations("Compare");
  const backHref = `/profilepage/${target.displayName}`;

  if (!(await canViewProfile(supabase, viewer.id, target.id))) {
    const tProfile = await getTranslations("Profile");
    return (
      <PageShell width="narrow">
        <EmptyState
          icon={<Lock />}
          title={tProfile("privateTitle")}
          description={tProfile("privateText", { name: target.displayName })}
          action={
            <ButtonLink href={`/socialpage/${viewer.user_metadata.displayName}`} variant="secondary" icon={<Groups />}>
              {tProfile("privateAction")}
            </ButtonLink>
          }
          className="mt-8 bg-surface"
        />
      </PageShell>
    );
  }

  const tab: Tab = TABS.includes(rawTab as Tab) ? (rawTab as Tab) : "theirs";
  const hideInvertebrates = await getHideInvertebrates(supabase, viewer);
  const [mine, theirs] = await Promise.all([
    getOwnedAnimals(supabase, viewer.id, hideInvertebrates),
    getOwnedAnimals(supabase, target.id, hideInvertebrates),
  ]);
  const comparison = compareCollections(mine, theirs);

  const ids: Record<Tab, number[]> = {
    theirs: comparison.onlyTheirs,
    photos: comparison.photoOnlyTheirs,
    both: comparison.both,
    mine: comparison.onlyMine,
  };

  const myRows = new Map(mine.map((row) => [row.animalId, row]));
  const theirRows = new Map(theirs.map((row) => [row.animalId, row]));
  const animals: CompareGridAnimal[] = ids[tab]
    .map((id) => {
      const row = (myRows.get(id) ?? theirRows.get(id))!;
      return {
        animalId: id,
        commonName: row.commonName,
        lexiconLink: row.lexiconLink,
        myPhoto: myRows.get(id)?.hasPhoto ?? false,
        theirPhoto: theirRows.get(id)?.hasPhoto ?? false,
      };
    })
    .sort((a, b) => a.commonName.localeCompare(b.commonName, "de"));

  return (
    <PageShell>
      <PageHeader
        title={t("pageTitle", { name: target.displayName })}
        subtitle={t("pageSubtitle", { mine: mine.length, theirs: theirs.length, name: target.displayName })}
        backHref={backHref}
        backLabel={t("backToProfile")}
      />
      <nav aria-label={t("tabsLabel")} className="flex gap-1 overflow-x-auto rounded-lg bg-surface-sunken p-1">
        {TABS.map((value) => (
          <Link
            key={value}
            href={`/comparepage/${target.displayName}?tab=${value}`}
            aria-current={tab === value ? "page" : undefined}
            className={cn(
              "flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-center text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              tab === value ? "bg-surface text-fg shadow-card" : "text-fg-muted hover:text-fg",
            )}
          >
            {t(`tabs.${value}`, { name: target.displayName })}
            <span className="ml-1 text-fg-subtle">({ids[value].length})</span>
          </Link>
        ))}
      </nav>
      <CompareGrid
        animals={animals}
        displayName={target.displayName}
        emptyText={t(`empty.${tab}`, { name: target.displayName })}
      />
    </PageShell>
  );
}
