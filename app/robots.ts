import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/app/[locale]/utils/seo";

/**
 * Pages behind login (see utils/supabase/middleware.ts). Crawlers only get a
 * redirect to the login page there. Every other crawler, AI crawlers included,
 * may read the public pages.
 */
const PRIVATE_PATHS = [
  "/homepage",
  "/collectionpage",
  "/profilepage",
  "/socialpage",
  "/settingspage",
  "/animallistspage",
  "/adminpage",
  "/suggestanimalpage",
  "/passwordreset",
  "/error",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: routing.locales.flatMap((locale) => PRIVATE_PATHS.map((path) => `/${locale}${path}`)),
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
