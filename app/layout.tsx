import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

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
      <body
        className={`${open_sans.className} bg-gray-200 font-bold text-slate-100`}
      >
        {children}
      </body>
    </html>
  );
}
