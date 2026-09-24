import path from "node:path";
import { ENDANGERMENT } from "@/app/[locale]/utils/lexiconFilters";

/**
 * Settings for the curated invertebrate import: which groups, how many
 * species per order, and how iNaturalist values map onto lexicon columns.
 */

export const PLACE_GERMANY = 7207;

export const DIR = path.resolve("scripts/invertebrates");
export const CACHE_DIR = path.join(DIR, ".cache");
export const OUT_DIR = path.join(DIR, "out");
export const FACTS_FILE = path.join(OUT_DIR, "facts.json");
export const DRAFT_FILE = path.join(OUT_DIR, "draft.csv");
export const IMAGES_DIR = path.join(OUT_DIR, "images");

export const USER_AGENT = "NatureLog lexicon import (+https://naturelog.de)";

/** Extra candidates beyond each quota, so pruning has spares to swap in. */
export const SPARE_FACTOR = 1.5;

export type Bucket = {
  category: "Insekt" | "Arachnoid" | "Sonstige Wirbellose";
  /** Label from ORDERS_BY_GENUS. */
  order: string;
  /** iNaturalist taxon name and rank the species are counted under. */
  taxon: string;
  rank: string;
  quota: number;
  /** Field guides give wingspans for butterflies and dragonflies. */
  size: "wingspan" | "body";
};

export const BUCKETS: Bucket[] = [
  { category: "Insekt", order: "Schmetterlinge (Lepidoptera)", taxon: "Lepidoptera", rank: "order", quota: 45, size: "wingspan" },
  { category: "Insekt", order: "Käfer (Coleoptera)", taxon: "Coleoptera", rank: "order", quota: 30, size: "body" },
  { category: "Insekt", order: "Libellen (Odonata)", taxon: "Odonata", rank: "order", quota: 20, size: "wingspan" },
  { category: "Insekt", order: "Hautflügler (Hymenoptera)", taxon: "Hymenoptera", rank: "order", quota: 25, size: "body" },
  { category: "Insekt", order: "Heuschrecken (Orthoptera)", taxon: "Orthoptera", rank: "order", quota: 10, size: "body" },
  { category: "Insekt", order: "Schnabelkerfe (Hemiptera)", taxon: "Hemiptera", rank: "order", quota: 10, size: "body" },
  { category: "Insekt", order: "Zweiflügler (Diptera)", taxon: "Diptera", rank: "order", quota: 5, size: "body" },
  { category: "Insekt", order: "Netzflügler (Neuroptera)", taxon: "Neuroptera", rank: "order", quota: 3, size: "body" },
  { category: "Insekt", order: "Ohrwürmer (Dermaptera)", taxon: "Dermaptera", rank: "order", quota: 2, size: "body" },
  { category: "Arachnoid", order: "Webspinnen (Araneae)", taxon: "Araneae", rank: "order", quota: 30, size: "body" },
  { category: "Arachnoid", order: "Weberknechte (Opiliones)", taxon: "Opiliones", rank: "order", quota: 5, size: "body" },
  { category: "Arachnoid", order: "Zecken (Ixodida)", taxon: "Ixodida", rank: "order", quota: 3, size: "body" },
  { category: "Arachnoid", order: "Pseudoskorpione (Pseudoscorpiones)", taxon: "Pseudoscorpiones", rank: "order", quota: 2, size: "body" },
  { category: "Sonstige Wirbellose", order: "Landlungenschnecken (Stylommatophora)", taxon: "Stylommatophora", rank: "order", quota: 10, size: "body" },
  { category: "Sonstige Wirbellose", order: "Asseln (Isopoda)", taxon: "Isopoda", rank: "order", quota: 3, size: "body" },
  { category: "Sonstige Wirbellose", order: "Doppelfüßer (Diplopoda)", taxon: "Diplopoda", rank: "class", quota: 2, size: "body" },
  { category: "Sonstige Wirbellose", order: "Hundertfüßer (Chilopoda)", taxon: "Chilopoda", rank: "class", quota: 1, size: "body" },
  { category: "Sonstige Wirbellose", order: "Zehnfußkrebse (Decapoda)", taxon: "Decapoda", rank: "order", quota: 3, size: "body" },
  { category: "Sonstige Wirbellose", order: "Wenigborster (Oligochaeta)", taxon: "Oligochaeta", rank: "subclass", quota: 1, size: "body" },
];

/** Only licences that stay usable if the site ever becomes commercial. */
export const LICENSES: Record<string, { text: string; link: string }> = {
  cc0: { text: "CC0 1.0", link: "https://creativecommons.org/publicdomain/zero/1.0/" },
  "cc-by": { text: "CC BY 4.0", link: "https://creativecommons.org/licenses/by/4.0/" },
  "cc-by-sa": { text: "CC BY-SA 4.0", link: "https://creativecommons.org/licenses/by-sa/4.0/" },
};

type Status = (typeof ENDANGERMENT)[number];

/** Rote Liste Deutschland categories (codes and spelled out) onto ENDANGERMENT. */
const ROTE_LISTE: Record<string, Status> = {
  "0": "Ausgestorben",
  "ausgestorben oder verschollen": "Ausgestorben",
  "1": "Vom Aussterben bedroht",
  "vom aussterben bedroht": "Vom Aussterben bedroht",
  "2": "Stark gefährdet",
  "stark gefährdet": "Stark gefährdet",
  "3": "Gefährdet",
  "gefährdet": "Gefährdet",
  g: "Gefährdet",
  "gefährdung unbekannten ausmaßes": "Gefährdet",
  r: "Extrem selten",
  "extrem selten": "Extrem selten",
  v: "Vorwarnliste",
  vorwarnliste: "Vorwarnliste",
  "*": "Nicht gefährdet",
  ungefährdet: "Nicht gefährdet",
  "nicht gefährdet": "Nicht gefährdet",
};

/** Anything else ("D", "nicht bewertet", IUCN codes) has no lexicon value. */
export const mapRoteListe = (raw: string | null | undefined): Status | null =>
  raw ? (ROTE_LISTE[raw.trim().toLowerCase()] ?? null) : null;

const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

/**
 * "Mai bis August" from observation counts per month (1–12): the months with
 * at least 10 % of the peak, read as one season. A season across the new year
 * starts after the longest quiet stretch.
 */
export function presenceTime(counts: Record<string, number>): string | null {
  const values = MONTHS.map((_, i) => counts[String(i + 1)] ?? 0);
  const peak = Math.max(...values);
  if (peak === 0) return null;
  const active = values.map((value) => value >= peak * 0.1);
  if (active.every(Boolean)) return "Ganzjährig";

  // Start the year after the longest run of inactive months.
  let bestStart = 0;
  let bestLength = 0;
  for (let start = 0; start < 12; start++) {
    let length = 0;
    while (length < 12 && !active[(start + length) % 12]) length++;
    if (length > bestLength) {
      bestLength = length;
      bestStart = start;
    }
  }
  const first = (bestStart + bestLength) % 12;
  let last = first;
  for (let step = 0; step < 12; step++) {
    const month = (first + step) % 12;
    if (active[month]) last = month;
  }
  return first === last ? MONTHS[first] : `${MONTHS[first]} bis ${MONTHS[last]}`;
}
