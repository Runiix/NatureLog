import { getTranslations } from "next-intl/server";
import getModerationQueue from "@/app/[locale]/actions/admin/getModerationQueue";
import ModerationQueue from "@/app/[locale]/components/admin/ModerationQueue";
import { PageHeader } from "@/app/[locale]/components/ui/PageHeader";
import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import requireAdmin from "@/utils/supabase/requireAdmin";

// Signed image URLs expire, so the queue is always read fresh.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const [{ pending, recent }, t] = await Promise.all([
    getModerationQueue(),
    getTranslations("Admin"),
  ]);

  return (
    <PageShell>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <ModerationQueue pending={pending} recent={recent} />
    </PageShell>
  );
}
