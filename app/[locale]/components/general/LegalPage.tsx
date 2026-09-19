import { getLocale, getTranslations } from "next-intl/server";
import { Card } from "../ui/Card";
import { PageShell } from "../ui/PageShell";

/**
 * Themed frame for the German legal texts (Impressum, terms). The texts stay
 * German — that version is the binding one — with a note for English readers.
 */
export default async function LegalPage({ children }: { children: React.ReactNode }) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("Legal")]);
  return (
    <PageShell width="narrow">
      {locale !== "de" && (
        <p className="rounded-lg bg-surface-sunken px-3 py-2 text-sm text-fg-muted">{t("germanOnly")}</p>
      )}
      <Card
        padding="lg"
        lang="de"
        className="flex flex-col gap-4 leading-relaxed text-fg-muted [&_a]:text-accent-text [&_a]:underline-offset-4 hover:[&_a]:underline [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-fg [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-fg [&_strong]:text-fg"
      >
        {children}
      </Card>
    </PageShell>
  );
}
