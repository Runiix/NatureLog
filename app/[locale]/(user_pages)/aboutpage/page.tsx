import { HelpOutline, Login, MenuBook } from "@mui/icons-material";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/app/[locale]/components/general/JsonLd";
import { ButtonLink } from "@/app/[locale]/components/ui/Button";
import { Card } from "@/app/[locale]/components/ui/Card";
import { PageHeader } from "@/app/[locale]/components/ui/PageHeader";
import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import {
  LOGO_PATH,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  localizedPath,
  pageMetadata,
} from "@/app/[locale]/utils/seo";
import { getSpeciesCount } from "@/app/[locale]/utils/speciesCount";
import { createClient } from "@/utils/supabase/server";

// Same feature list as the landing page, whose copy it reuses.
const FEATURES = ["lexicon", "collection", "achievements", "lists", "community", "profile", "app"] as const;
const AUDIENCE = ["birders", "photographers", "families", "schools", "walkers"] as const;
const EXTRAS = ["daily", "quiz", "lens", "suggest"] as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return pageMetadata({ locale, path: "/aboutpage", title: t("aboutTitle"), description: t("aboutDescription"), absoluteTitle: true });
}

/**
 * Plain-language description of the app for new visitors, search engines and
 * AI assistants that answer "is there an app for …" questions.
 */
export default async function AboutPage({ params }: Props) {
  const [{ locale }, supabase] = await Promise.all([params, createClient()]);
  const [t, tLanding, tMeta, count] = await Promise.all([
    getTranslations("About"),
    getTranslations("Landing"),
    getTranslations("Meta"),
    getSpeciesCount(supabase),
  ]);

  return (
    <PageShell width="narrow">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: SITE_NAME,
          url: SITE_URL,
          description: tMeta("aboutDescription"),
          applicationCategory: "EducationalApplication",
          applicationSubCategory: "Naturbeobachtung",
          operatingSystem: "Web, Android, iOS",
          browserRequirements: "Requires a modern web browser",
          inLanguage: ["de", "en"],
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
          image: absoluteUrl(LOGO_PATH),
          mainEntityOfPage: absoluteUrl(localizedPath(locale, "/aboutpage")),
          publisher: {
            "@type": "Organization",
            "@id": `${SITE_URL}/#organization`,
            name: SITE_NAME,
            url: SITE_URL,
            logo: absoluteUrl(LOGO_PATH),
          },
          featureList: FEATURES.map((id) => tLanding(`features.${id}.title`)),
        }}
      />
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <Card padding="lg" className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">{t("whatTitle")}</h2>
        <p className="leading-relaxed text-fg-muted">{t("whatText", { count })}</p>
      </Card>

      <Card padding="lg" className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">{t("audienceTitle")}</h2>
        <ul className="list-disc space-y-1 pl-5 text-fg-muted">
          {AUDIENCE.map((id) => (
            <li key={id}>{t(`audience.${id}`)}</li>
          ))}
        </ul>
      </Card>

      <Card padding="lg" className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{t("featuresTitle")}</h2>
        <dl className="flex flex-col gap-3">
          {FEATURES.map((id) => (
            <div key={id}>
              <dt className="font-semibold text-fg">{tLanding(`features.${id}.title`)}</dt>
              <dd className="text-fg-muted">{tLanding(`features.${id}.text`)}</dd>
            </div>
          ))}
        </dl>
        <h3 className="mt-2 font-semibold">{t("extrasTitle")}</h3>
        <ul className="list-disc space-y-1 pl-5 text-fg-muted">
          {EXTRAS.map((id) => (
            <li key={id}>{t(`extras.${id}`)}</li>
          ))}
        </ul>
      </Card>

      <Card padding="lg" className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">{t("freeTitle")}</h2>
        <p className="leading-relaxed text-fg-muted">{t("freeText")}</p>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <ButtonLink href="/lexiconpage" icon={<MenuBook />}>
          {t("ctaLexicon")}
        </ButtonLink>
        <ButtonLink href="/loginpage" variant="secondary" icon={<Login />}>
          {t("ctaRegister")}
        </ButtonLink>
        <ButtonLink href="/faqpage" variant="secondary" icon={<HelpOutline />}>
          {t("ctaFaq")}
        </ButtonLink>
      </div>
    </PageShell>
  );
}
