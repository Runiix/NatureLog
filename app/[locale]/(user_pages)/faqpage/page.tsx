import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/app/[locale]/components/general/JsonLd";
import { Card } from "@/app/[locale]/components/ui/Card";
import { PageHeader } from "@/app/[locale]/components/ui/PageHeader";
import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import { absoluteUrl, localizedPath, pageMetadata } from "@/app/[locale]/utils/seo";
import { getSpeciesCount } from "@/app/[locale]/utils/speciesCount";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/utils/supabase/server";

type Props = { params: Promise<{ locale: string }> };

// Copy lives in messages/*.json under Faq.items.<id>.
const QUESTIONS = [
  "whatIs",
  "free",
  "app",
  "species",
  "identify",
  "record",
  "photos",
  "privacy",
  "missing",
  "deleteAccount",
] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return pageMetadata({ locale, path: "/faqpage", title: t("faqTitle"), description: t("faqDescription"), absoluteTitle: true });
}

/**
 * Questions phrased the way people ask search engines and AI assistants. The
 * FAQPage markup repeats the visible text exactly, as Google requires.
 */
export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const [t, count] = await Promise.all([getTranslations("Faq"), getSpeciesCount(supabase)]);
  const items = QUESTIONS.map((id) => ({
    q: t(`items.${id}.q`),
    a: t(`items.${id}.a`, { count }),
  }));

  return (
    <PageShell width="narrow">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          url: absoluteUrl(localizedPath(locale, "/faqpage")),
          inLanguage: locale,
          mainEntity: items.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <Card padding="lg" className="flex flex-col divide-y divide-border-muted">
        {items.map(({ q, a }) => (
          <section key={q} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
            <h2 className="text-lg font-semibold">{q}</h2>
            <p className="leading-relaxed text-fg-muted">{a}</p>
          </section>
        ))}
      </Card>
      <p className="text-sm text-fg-muted">
        {t("moreQuestions")}{" "}
        <Link href="/contactpage" className="font-medium text-accent-text hover:underline">
          {t("contact")}
        </Link>
      </p>
    </PageShell>
  );
}
