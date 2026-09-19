import { getTranslations } from "next-intl/server";
import getLexiconQueue from "@/app/[locale]/actions/admin/getLexiconQueue";
import getModerationQueue from "@/app/[locale]/actions/admin/getModerationQueue";
import getReports from "@/app/[locale]/actions/admin/getReports";
import CreateAnimalForm from "@/app/[locale]/components/admin/CreateAnimalForm";
import LexiconQueue from "@/app/[locale]/components/admin/LexiconQueue";
import ModerationQueue from "@/app/[locale]/components/admin/ModerationQueue";
import ReportQueue from "@/app/[locale]/components/admin/ReportQueue";
import { PageHeader } from "@/app/[locale]/components/ui/PageHeader";
import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import { cn } from "@/app/[locale]/utils/cn";
import { Link } from "@/i18n/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import requireAdmin from "@/utils/supabase/requireAdmin";

// Signed image URLs expire, so the queue is always read fresh.
export const dynamic = "force-dynamic";

const TABS = ["images", "reports", "lexicon", "new"] as const;
type Tab = (typeof TABS)[number];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { tab: rawTab } = await searchParams;
  const tab: Tab = TABS.includes(rawTab as Tab) ? (rawTab as Tab) : "images";

  const pendingCount = async (table: "image_moderation" | "lexicon_submissions") => {
    const { count } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    return count ?? 0;
  };

  // Reports aren't readable with the user's client, so they're counted as admin.
  const reportCount = async () => {
    const { count } = await createAdminClient()
      .from("reports")
      .select("id", { count: "exact", head: true });
    return count ?? 0;
  };

  const [t, imageCount, reportsCount, lexiconCount, content] = await Promise.all([
    getTranslations("Admin"),
    pendingCount("image_moderation"),
    reportCount(),
    pendingCount("lexicon_submissions"),
    tab === "images"
      ? getModerationQueue().then(({ pending, recent }) => (
          <ModerationQueue pending={pending} recent={recent} />
        ))
      : tab === "reports"
        ? getReports().then((items) => <ReportQueue items={items} />)
        : tab === "lexicon"
          ? getLexiconQueue().then((items) => <LexiconQueue items={items} />)
          : Promise.resolve(<CreateAnimalForm />),
  ]);

  const counts: Partial<Record<Tab, number>> = {
    images: imageCount,
    reports: reportsCount,
    lexicon: lexiconCount,
  };

  return (
    <PageShell>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <nav aria-label={t("tabs.label")} className="flex gap-1 overflow-x-auto rounded-lg bg-surface-sunken p-1">
        {TABS.map((value) => (
          <Link
            key={value}
            href={`/adminpage?tab=${value}`}
            aria-current={tab === value ? "page" : undefined}
            className={cn(
              "flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-center text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              tab === value ? "bg-surface text-fg shadow-card" : "text-fg-muted hover:text-fg",
            )}
          >
            {t(`tabs.${value}`)}
            {counts[value] ? <span className="ml-1 text-fg-subtle">({counts[value]})</span> : null}
          </Link>
        ))}
      </nav>
      {content}
    </PageShell>
  );
}
