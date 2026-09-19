import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { routing } from "@/i18n/routing";
import type { Database } from "@/utils/supabase/database.types";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://naturelog.de").replace(/\/$/, "");
export const SITE_NAME = "NatureLog";
export const LOGO_PATH = "/icons/icon.png";

/** `/de` for the home page, `/de/lexiconpage` for everything else. */
export const localizedPath = (locale: string, path: string) =>
  `/${locale}${path === "/" ? "" : path}`;

export const absoluteUrl = (path: string) => `${SITE_URL}${path}`;

/** hreflang map for one page; `x-default` points at the German version. */
export const languageAlternates = (path: string, absolute = false) => {
  const url = (locale: string) =>
    absolute ? absoluteUrl(localizedPath(locale, path)) : localizedPath(locale, path);
  return {
    ...Object.fromEntries(routing.locales.map((locale) => [locale, url(locale)])),
    "x-default": url(routing.defaultLocale),
  };
};

/**
 * Title, description, canonical, hreflang and Open Graph for one public page.
 * Next.js replaces a parent's `openGraph` object instead of merging it, so
 * every page gets the complete set from here.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
  absoluteTitle = false,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
  image?: string | null;
  absoluteTitle?: boolean;
}): Metadata {
  const url = localizedPath(locale, path);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: locale === "de" ? "de_DE" : "en_US",
      type: "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description },
  };
}

/** Shortens text to a meta description without cutting a word in half. */
export function toDescription(text: string, max = 155) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.–-]$/, "")}…`;
}

/**
 * Anon client without cookies, for requests that have no user (sitemap). It
 * sees exactly what a signed-out visitor sees.
 */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
