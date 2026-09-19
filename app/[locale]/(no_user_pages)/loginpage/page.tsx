import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AuthForm from "../../components/auth/AuthForm";
import AuthShell from "../../components/auth/AuthShell";
import { pageMetadata } from "../../utils/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return pageMetadata({ locale, path: "/loginpage", title: t("loginTitle"), description: t("loginDescription") });
}

export default function LoginPage() {
  return (
    <AuthShell>
      <AuthForm />
    </AuthShell>
  );
}
