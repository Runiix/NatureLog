import { getTranslations } from "next-intl/server";
import ContactForm, { CONTACT_EMAIL } from "@/app/[locale]/components/general/ContactForm";
import { Card } from "@/app/[locale]/components/ui/Card";
import { PageHeader } from "@/app/[locale]/components/ui/PageHeader";
import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import type { Metadata } from "next";
import { pageMetadata } from "@/app/[locale]/utils/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return pageMetadata({ locale, path: "/contactpage", title: t("contactTitle"), description: t("contactDescription") });
}

export default async function ContactPage() {
  const t = await getTranslations("Contact");
  return (
    <PageShell width="narrow">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <Card padding="lg" className="flex flex-col gap-6">
        <p className="text-fg-muted">{t("topics")}</p>
        <ContactForm />
      </Card>
      <p className="text-sm text-fg-muted">
        {t("direct")}{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-accent-text hover:underline">
          {CONTACT_EMAIL}
        </a>
      </p>
    </PageShell>
  );
}
