import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { cookies } from "next/headers";
import { ThemeProvider } from "./components/ui/theme/ThemeProvider";
import { ThemeScript } from "./components/ui/theme/ThemeScript";
import { ToastProvider } from "./components/ui/Toast";
import { THEME_COOKIE, parseTheme } from "./components/ui/theme/theme";
const open_sans = Open_Sans({ subsets: ["latin"] });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/**
 * Namespaces only server components read. Leaving them out of the client
 * provider keeps them out of every page's serialized payload.
 */
const SERVER_ONLY_NAMESPACES = ["Landing", "NotFound", "Footer", "Legal", "Meta", "ErrorPage"];

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: { default: "NatureLog", template: "%s · NatureLog" },
    description: t("description"),
    manifest: "/manifest.json",
  };
}
type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};
export default async function RootLayout({
  children,
  params,
}: Readonly<Props>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);
  const tGeneral = await getTranslations({ locale, namespace: "General" });
  const clientMessages = Object.fromEntries(
    Object.entries(await getMessages()).filter(([namespace]) => !SERVER_ONLY_NAMESPACES.includes(namespace)),
  );
  return (
    // An explicit choice is rendered straight into the class, so it is correct
    // from the first byte. For "system" the head script may add the class
    // before hydration, hence suppressHydrationWarning on this element only.
    <html
      lang={locale}
      className={theme === "dark" ? "dark" : undefined}
      suppressHydrationWarning
    >
      <head>
        {theme === "system" && <ThemeScript />}
        {/* The Metadata API has no field for preconnect/dns-prefetch. The
            manifest link is emitted by the `manifest` entry above. */}
        {SUPABASE_URL && <link rel="preconnect" href={SUPABASE_URL} crossOrigin="" />}
      </head>
      <body className={`${open_sans.className} flex min-h-screen flex-col bg-canvas font-normal text-fg`}>
        <ThemeProvider initialTheme={theme}>
          <NextIntlClientProvider messages={clientMessages}>
            <ToastProvider>
              <a
                href="#main"
                className="sr-only z-[70] rounded-lg bg-accent-solid px-4 py-2 font-medium text-accent-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
              >
                {tGeneral("skipToContent")}
              </a>
              <main id="main" className="flex-grow">
                <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
              </main>
            </ToastProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
