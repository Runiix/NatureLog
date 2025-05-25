import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

import CookieConsentBanner from "./components/general/CookieConsentBanner";
import Footer from "./components/general/Footer";
import Head from "next/head";

const open_sans = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NatureLog",
  description:
    "NatureLog is a social Media application that allows users to track their nature sightings and share their favorite images and sightings with others",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="preconnect"
          href="https://umvtbsrjbvivfkcmvtxk.supabase.co"
        />
      </Head>
      <body
        className={`${open_sans.className} bg-gray-200 font-bold text-slate-100 min-h-screen flex flex-col`}
      >
        <main className="flex-grow">
          <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
        </main>
        {/* <CookieConsentBanner /> */}
        <footer>
          <Footer />
        </footer>
      </body>
    </html>
  );
}
