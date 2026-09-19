import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import {
  absoluteUrl,
  createPublicClient,
  languageAlternates,
  localizedPath,
} from "@/app/[locale]/utils/seo";

// Rebuilt at most once a day, so new species show up without a deploy.
export const revalidate = 86400;

/** Pages a signed-out visitor can open. Everything else redirects to login. */
const PUBLIC_PAGES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/lexiconpage", priority: 0.9 },
  { path: "/aboutpage", priority: 0.8 },
  { path: "/faqpage", priority: 0.7 },
  { path: "/loginpage", priority: 0.5 },
  { path: "/contactpage", priority: 0.3 },
  { path: "/impressum", priority: 0.2 },
  { path: "/termsofservice", priority: 0.2 },
];

const PAGE_SIZE = 1000;

async function getAnimalNames() {
  const supabase = createPublicClient();
  const names: string[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("animals")
      .select("common_name")
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    if (error) {
      console.error("Sitemap: failed to load animals", error);
      break;
    }
    names.push(...data.map((row) => row.common_name));
    if (data.length < PAGE_SIZE) break;
  }
  return names;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entry = (path: string, priority: number) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(localizedPath(locale, path)),
      changeFrequency: "weekly" as const,
      // English copies of German pages are secondary.
      priority: locale === routing.defaultLocale ? priority : priority * 0.8,
      alternates: { languages: languageAlternates(path, true) },
    }));

  const animals = await getAnimalNames();
  return [
    ...PUBLIC_PAGES.flatMap(({ path, priority }) => entry(path, priority)),
    ...animals.flatMap((name) => entry(`/animalpage/${encodeURIComponent(name)}`, 0.6)),
  ];
}
