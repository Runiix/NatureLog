import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import SettingsList from "@/app/[locale]/components/settings/SettingsList";
import { PageHeader } from "@/app/[locale]/components/ui/PageHeader";
import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import { getUser } from "@/app/[locale]/utils/data";
import { createClient } from "@/utils/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) redirect("/loginpage");

  const [{ data, error }, t] = await Promise.all([
    supabase
      .from("profiles")
      .select("is_public, hide_invertebrates")
      .eq("user_id", user.id)
      .maybeSingle(),
    getTranslations("Settings"),
  ]);
  if (error) console.error("Error getting settings", error);

  return (
    <PageShell width="narrow">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <SettingsList
        user={user}
        isPublic={data?.is_public ?? false}
        hideInvertebrates={data?.hide_invertebrates ?? false}
      />
    </PageShell>
  );
}
