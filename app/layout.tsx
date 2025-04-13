import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import CookieConsentBanner from "./components/general/CookieConsentBanner";
import Footer from "./components/general/Footer";

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
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${open_sans.className} bg-gray-200 font-bold text-slate-100 min-h-screen flex flex-col`}
      >
        <main className="flex-grow">{children}</main>
        {/* <CookieConsentBanner /> */}
        <footer>
          <Footer />
        </footer>
      </body>
    </html>
  );
}
