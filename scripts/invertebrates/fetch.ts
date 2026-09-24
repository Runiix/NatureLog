/**
 * Step 1 of the invertebrate import: collects facts for the most-observed
 * species in Germany per order (see BUCKETS) from iNaturalist and the German
 * Wikipedia, and writes them to out/facts.json. Read-only everywhere.
 *
 *   npm run inverts:fetch
 */
import { mkdir, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { isInvertebrate } from "@/app/[locale]/utils/lexiconFilters";
import type { Database } from "@/utils/supabase/database.types";
import {
  BUCKETS,
  FACTS_FILE,
  LICENSES,
  mapRoteListe,
  OUT_DIR,
  PLACE_GERMANY,
  presenceTime,
  SPARE_FACTOR,
  type Bucket,
} from "./config";
import { getJson } from "./http";

const INAT = "https://api.inaturalist.org/v1";

type TaxonRef = { id: number; name: string; rank: string };
type Photo = { id: number; license_code: string | null; attribution: string; url: string; original_url?: string };
type Taxon = TaxonRef & {
  names?: { name: string; locale: string; is_valid?: boolean; position?: number }[];
  taxon_photos?: { photo: Photo }[];
  conservation_statuses?: { status: string; status_name?: string; authority?: string; place?: { id: number } | null }[];
  wikipedia_url?: string | null;
};
type Results<T> = { results: T[] };

export type Fact = {
  inat_taxon_id: number;
  category: Bucket["category"];
  order: string;
  size_means: Bucket["size"];
  /** Position within its order by observations in Germany (1 = most observed). */
  rank: number;
  keep: boolean;
  observations: number;
  scientific_name: string;
  common_name: string;
  german_names: string[];
  endangerment_raw: string | null;
  endangerment_status: string | null;
  months: Record<string, number>;
  presence_time: string | null;
  similar_ids: number[];
  similar_animals: string[];
  photo: { url: string; credit_text: string; credit_link: string; license_text: string; license_link: string } | null;
  wikipedia: { title: string; url: string; intro: string; appearance: string; habitat: string } | null;
  flags: string[];
};

const chunk = <T,>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size));

async function taxonId(bucket: Bucket): Promise<number> {
  const { results } = await getJson<Results<TaxonRef>>(
    `${INAT}/taxa?q=${encodeURIComponent(bucket.taxon)}&rank=${bucket.rank}&per_page=30`,
  );
  const match = results.find((taxon) => taxon.name === bucket.taxon && taxon.rank === bucket.rank);
  if (!match) throw new Error(`No iNaturalist taxon ${bucket.rank} ${bucket.taxon}`);
  return match.id;
}

async function topSpecies(bucket: Bucket) {
  const id = await taxonId(bucket);
  const want = Math.ceil(bucket.quota * SPARE_FACTOR);
  const { results } = await getJson<Results<{ count: number; taxon: TaxonRef }>>(
    `${INAT}/observations/species_counts?place_id=${PLACE_GERMANY}&taxon_id=${id}` +
      `&quality_grade=research&per_page=${want + 20}`,
  );
  return results.filter((row) => row.taxon.rank === "species").slice(0, want);
}

function germanNames(taxon: Taxon) {
  return (taxon.names ?? [])
    .filter((name) => name.locale === "de" && name.is_valid !== false)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((name) => name.name);
}

/**
 * "(c) Jane Doe, some rights reserved (CC BY)" → "Jane Doe". The licence has
 * its own columns; a few attributions embed whole citations, so an explicit
 * "[Photo: …]" wins and the rest is capped at the column limit.
 */
function creditName(attribution: string) {
  const photographer = attribution.match(/\[Photo: ([^\]]+)\]/)?.[1];
  const name =
    photographer ??
    attribution
      .replace(/^\(c\)\s*/i, "")
      .replace(/,?\s*(some|all|no) rights reserved.*$/i, "")
      .trim();
  // Public-domain photos often carry no name at all.
  if (!name) return "iNaturalist";
  return name.length > 200 ? `${name.slice(0, 197)}…` : name;
}

function pickPhoto(taxon: Taxon): Fact["photo"] {
  const photo = (taxon.taxon_photos ?? [])
    .map((entry) => entry.photo)
    .find((candidate) => candidate.license_code && LICENSES[candidate.license_code]);
  if (!photo) return null;
  const license = LICENSES[photo.license_code!];
  return {
    url: photo.original_url ?? photo.url.replace(/\/square\./, "/original."),
    credit_text: creditName(photo.attribution),
    credit_link: `https://www.inaturalist.org/photos/${photo.id}`,
    license_text: license.text,
    license_link: license.link,
  };
}

/**
 * Curated taxon photos are mostly CC BY-NC. Falls back to the most-faved
 * research-grade observation photo from Germany with an allowed licence.
 */
async function observationPhoto(taxonId: number): Promise<Fact["photo"]> {
  const { results } = await getJson<Results<{ photos: Photo[] }>>(
    `${INAT}/observations?taxon_id=${taxonId}&place_id=${PLACE_GERMANY}&quality_grade=research` +
      `&photo_license=${Object.keys(LICENSES).join(",")}&order_by=votes&per_page=10`,
  );
  const photos = results.flatMap((observation) => observation.photos);
  return pickPhoto({ id: taxonId, name: "", rank: "", taxon_photos: photos.map((photo) => ({ photo })) });
}

function germanStatus(taxon: Taxon) {
  const status = (taxon.conservation_statuses ?? []).find((entry) => entry.place?.id === PLACE_GERMANY);
  return status ? (status.status_name ?? status.status) : null;
}

/** Intro plus the appearance and habitat sections of a plain-text article. */
function sections(text: string) {
  // Level-2 headings only, so a section keeps its === subsections ===.
  const parts = text.split(/\n(?=== [^=])/);
  const intro = parts[0]?.trim() ?? "";
  const section = (pattern: RegExp, max: number) =>
    parts
      .filter((part) => pattern.test(part.split("\n")[0]))
      .join("\n")
      .trim()
      .slice(0, max);
  return {
    intro: intro.slice(0, 2000),
    appearance: section(/Merkmale|Beschreibung|Aussehen|Körperbau|Erkennungsmerkmale/, 2500),
    habitat: section(/Lebensraum|Lebensweise|Vorkommen|Verbreitung|Flugzeit|Phänologie/, 1500),
  };
}

async function wikipedia(titles: string[]): Promise<Fact["wikipedia"]> {
  for (const title of titles) {
    const { query } = await getJson<{
      query?: { pages?: { title: string; missing?: boolean; extract?: string; fullurl?: string; pageprops?: { disambiguation?: string } }[] };
    }>(
      "https://de.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&redirects=1" +
        `&prop=extracts|info|pageprops&inprop=url&explaintext=1&titles=${encodeURIComponent(title)}`,
    );
    const page = query?.pages?.[0];
    if (!page || page.missing || !page.extract || page.pageprops?.disambiguation !== undefined) continue;
    return { title: page.title, url: page.fullurl ?? "", ...sections(page.extract) };
  }
  return null;
}

async function existingNames() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set");
  const { data, error } = await createClient<Database>(url, key)
    .from("animals")
    .select("common_name, category");
  if (error) throw new Error(`Reading animals failed: ${error.message}`);
  // Invertebrates are replaced by this import, so only the others can collide.
  return new Set(
    data.filter((row) => !isInvertebrate(row.category)).map((row) => row.common_name.toLowerCase()),
  );
}

async function main() {
  const taken = await existingNames();
  const facts: Fact[] = [];
  const seen = new Set<number>();

  for (const bucket of BUCKETS) {
    const species = await topSpecies(bucket);
    console.log(`${bucket.order}: ${species.length} candidates`);
    species.forEach(({ count, taxon }, index) => {
      if (seen.has(taxon.id)) return;
      seen.add(taxon.id);
      facts.push({
        inat_taxon_id: taxon.id,
        category: bucket.category,
        order: bucket.order,
        size_means: bucket.size,
        rank: index + 1,
        keep: index < bucket.quota,
        observations: count,
        scientific_name: taxon.name,
        common_name: taxon.name,
        german_names: [],
        endangerment_raw: null,
        endangerment_status: null,
        months: {},
        presence_time: null,
        similar_ids: [],
        similar_animals: [],
        photo: null,
        wikipedia: null,
        flags: [],
      });
    });
  }

  const byId = new Map(facts.map((fact) => [fact.inat_taxon_id, fact]));

  let detailed = 0;
  for (const ids of chunk([...byId.keys()], 30)) {
    const { results } = await getJson<Results<Taxon>>(
      `${INAT}/taxa/${ids.join(",")}?locale=de&preferred_place_id=${PLACE_GERMANY}&all_names=true`,
    );
    for (const taxon of results) {
      const fact = byId.get(taxon.id);
      if (!fact) continue;
      fact.german_names = germanNames(taxon);
      fact.common_name = fact.german_names[0] ?? taxon.name;
      fact.photo = pickPhoto(taxon);
      fact.endangerment_raw = germanStatus(taxon);
      fact.endangerment_status = mapRoteListe(fact.endangerment_raw);
    }
    detailed += ids.length;
    console.log(`details: ${detailed}/${facts.length}`);
  }

  for (const [index, fact] of facts.entries()) {
    const [histogram, similar] = await Promise.all([
      getJson<{ results: { month_of_year: Record<string, number> } }>(
        `${INAT}/observations/histogram?taxon_id=${fact.inat_taxon_id}&place_id=${PLACE_GERMANY}` +
          "&quality_grade=research&interval=month_of_year",
      ),
      getJson<Results<{ count: number; taxon: TaxonRef }>>(
        `${INAT}/identifications/similar_species?taxon_id=${fact.inat_taxon_id}&place_id=${PLACE_GERMANY}`,
      ),
    ]);
    fact.photo ??= await observationPhoto(fact.inat_taxon_id);
    fact.months = histogram.results.month_of_year;
    fact.presence_time = presenceTime(fact.months);
    fact.similar_ids = similar.results
      .filter((row) => byId.has(row.taxon.id))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((row) => row.taxon.id);
    fact.wikipedia = await wikipedia([fact.scientific_name, ...fact.german_names.slice(0, 1)]);
    if ((index + 1) % 10 === 0) console.log(`species: ${index + 1}/${facts.length}`);
  }

  const nameCount = new Map<string, number>();
  for (const fact of facts) {
    const key = fact.common_name.toLowerCase();
    nameCount.set(key, (nameCount.get(key) ?? 0) + 1);
  }
  for (const fact of facts) {
    fact.similar_animals = fact.similar_ids.map((id) => byId.get(id)!.common_name);
    if (fact.german_names.length === 0) fact.flags.push("needs_name");
    if (taken.has(fact.common_name.toLowerCase())) fact.flags.push("name_taken");
    if ((nameCount.get(fact.common_name.toLowerCase()) ?? 0) > 1) fact.flags.push("name_duplicate");
    if (!fact.photo) fact.flags.push("no_photo");
    if (!fact.wikipedia) fact.flags.push("no_wikipedia");
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(FACTS_FILE, JSON.stringify(facts, null, 2));
  const flagged = facts.filter((fact) => fact.flags.length > 0).length;
  console.log(`Wrote ${facts.length} species (${facts.filter((fact) => fact.keep).length} kept, ${flagged} flagged) to ${FACTS_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
