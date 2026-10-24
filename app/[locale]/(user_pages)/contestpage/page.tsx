import { EmojiEvents } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import ContestView from "@/app/[locale]/components/contest/ContestView";
import HallOfFame from "@/app/[locale]/components/contest/HallOfFame";
import { EmptyState } from "@/app/[locale]/components/ui/EmptyState";
import { PageHeader } from "@/app/[locale]/components/ui/PageHeader";
import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import { getContests, getWinners } from "@/app/[locale]/utils/contest-queries";
import { getUser } from "@/app/[locale]/utils/data";
import { createClient } from "@/utils/supabase/server";

// Rounds open and close by the clock.
export const dynamic = "force-dynamic";

export default async function ContestPage() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) redirect("/loginpage");

  const [t, [submission], [voting], winners] = await Promise.all([
    getTranslations("Contest"),
    getContests(supabase, ["submission"], 1),
    getContests(supabase, ["voting"], 1),
    getWinners(supabase),
  ]);

  return (
    <PageShell>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      {!submission && !voting && (
        <EmptyState icon={<EmojiEvents />} title={t("emptyTitle")} description={t("emptyText")} />
      )}
      {submission && <ContestView supabase={supabase} contest={submission} viewerId={user.id} />}
      {voting && <ContestView supabase={supabase} contest={voting} viewerId={user.id} />}
      <HallOfFame winners={winners} />
    </PageShell>
  );
}
