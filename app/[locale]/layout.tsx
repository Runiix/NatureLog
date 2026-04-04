import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import CookieConsentBanner from "./components/general/CookieConsentBanner";
import Footer from "./components/general/Footer";
import Head from "next/head";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
const open_sans = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NatureLog",
  description:
    "NatureLog is a social Media application that allows users to track their nature sightings and share their favorite images and sightings with others",
};
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
  return (
    <html lang={locale}>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="preconnect"
          href="https://umvtbsrjbvivfkcmvtxk.supabase.co"
          crossOrigin=""
        />
        <link rel="dns-prefetch" href="//umvtbsrjbvivfkcmvtxk.supabase.co" />
      </Head>
      <body
        className={`${open_sans.className} bg-gray-200 font-bold text-slate-100 min-h-screen flex flex-col`}
      >
        <NextIntlClientProvider>
          <main className="flex-grow">
            <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
          </main>
        </NextIntlClientProvider>
        {/* <CookieConsentBanner /> */}
        {/* <footer>
          <Footer />
        </footer> */}
      </body>
    </html>
  );
}
