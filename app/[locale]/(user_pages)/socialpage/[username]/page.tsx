import { getTranslations } from "next-intl/server";
import SocialFilter from "@/app/[locale]/components/social/SocialFilter";
import SocialList from "@/app/[locale]/components/social/SocialList";
import { PageHeader } from "@/app/[locale]/components/ui/PageHeader";
import { PageShell } from "@/app/[locale]/components/ui/PageShell";

export default async function SocialPage() {
  const t = await getTranslations("Social");
  return (
    <PageShell>
      <PageHeader title={t("social")} subtitle={t("subtitle")} />
      <SocialFilter />
      <SocialList />
    </PageShell>
  );
}
