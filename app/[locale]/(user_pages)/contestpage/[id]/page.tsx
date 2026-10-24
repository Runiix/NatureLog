import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import ContestView from "@/app/[locale]/components/contest/ContestView";
import { PageHeader } from "@/app/[locale]/components/ui/PageHeader";
import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import { getContest } from "@/app/[locale]/utils/contest-queries";
import { getUser } from "@/app/[locale]/utils/data";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** One contest, current or archived. */
export default async function ContestArchivePage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const [supabase, { id }] = await Promise.all([createClient(), params]);
  const user = await getUser(supabase);
  if (!user) redirect("/loginpage");

  if (!UUID.test(id)) notFound();
  const contest = await getContest(supabase, id);
  if (!contest) notFound();

  const t = await getTranslations("Contest");
  return (
    <PageShell>
      <PageHeader
        title={t("archiveTitle", { name: contest.animal?.commonName ?? t("unknownSpecies") })}
        backHref="/contestpage"
        backLabel={t("backToContest")}
      />
      <ContestView supabase={supabase} contest={contest} viewerId={user.id} />
    </PageShell>
  );
}
