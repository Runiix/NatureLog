import { getTranslations } from "next-intl/server";
import getMyLexiconSuggestions from "@/app/[locale]/actions/lexicon/getMyLexiconSuggestions";
import MySuggestions from "@/app/[locale]/components/lexicon/MySuggestions";
import SuggestAnimalForm from "@/app/[locale]/components/lexicon/SuggestAnimalForm";
import { PageHeader } from "@/app/[locale]/components/ui/PageHeader";
import { PageShell } from "@/app/[locale]/components/ui/PageShell";

// The list of the user's suggestions changes as admins decide them.
export const dynamic = "force-dynamic";

export default async function SuggestAnimalPage() {
  const [suggestions, t] = await Promise.all([
    getMyLexiconSuggestions(),
    getTranslations("LexiconSuggest.page"),
  ]);

  return (
    <PageShell className="max-w-3xl">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        backHref="/lexiconpage"
        backLabel={t("back")}
      />
      <SuggestAnimalForm />
      {/* Keyed so a new submission (router.refresh) shows up in the list. */}
      <MySuggestions suggestions={suggestions} />
    </PageShell>
  );
}
