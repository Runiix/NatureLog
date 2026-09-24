/**
 * The lexicon's filter vocabulary, shared by the filter UI and getAnimals.
 * The server only accepts values listed here, so a crafted URL cannot pick an
 * arbitrary sort column or smuggle extra conditions into a PostgREST filter.
 * Values are the literal strings stored in the `animals` table.
 */

export const GENERA = [
  "Säugetier",
  "Vogel",
  "Amphibie",
  "Reptil",
  "Insekt",
  "Arachnoid",
  "Sonstige Wirbellose",
] as const;

/** Groups behind the "Wirbellose" switch; they are counted apart from vertebrates. */
export const INVERTEBRATE_GROUPS: readonly string[] = ["Insekt", "Arachnoid", "Sonstige Wirbellose"];
export const VERTEBRATE_GROUPS: readonly string[] = GENERA.filter((genus) => !INVERTEBRATE_GROUPS.includes(genus));

export const isInvertebrate = (category: string | null | undefined) =>
  category != null && INVERTEBRATE_GROUPS.includes(category);

/**
 * The "Wirbellose anzeigen" switch. The URL holds `show` or `hide` only when
 * it differs from the user's setting; without it the setting decides.
 */
export function showsInvertebrates(value: string | null, hideByDefault: boolean) {
  return value === "show" || (value !== "hide" && !hideByDefault);
}

export const ORDERS_BY_GENUS: Record<string, readonly string[]> = {
  Säugetier: [
    "Hasenartige (Lagomorpha)",
    "Nagetiere (Rodentia)",
    "Insektenfresser (Eulipotyphla)",
    "Paarhufer (Artiodactyla)",
    "Raubtiere (Carnivora)",
    "Fledertiere (Chiroptera)",
  ],
  Vogel: [
    "Galliformes – Hühnervögel",
    "Anseriformes – Entenvögel",
    "Caprimulgiformes – Nachtschwalbenvögel",
    "Apodiformes – Seglervögel",
    "Otidiformes – Trappen",
    "Cuculiformes – Kuckucksvögel",
    "Pterocliformes – Flughühner",
    "Columbiformes – Taubenvögel",
    "Gruiformes – Kranichvögel",
    "Podicipediformes – Lappentaucher",
    "Phoenicopteriformes – Flamingos",
    "Charadriiformes – Regenpfeifervögel",
    "Gaviiformes – Seetaucher",
    "Procellariiformes – Röhrennasen",
    "Ciconiiformes – Störche",
    "Suliformes – Ruderfüßer",
    "Pelecaniformes – Pelikanvögel",
    "Accipitriformes – Greifvögel",
    "Strigiformes – Eulen",
    "Bucerotiformes – Hornvögel",
    "Coraciiformes – Rackenvögel",
    "Piciformes – Spechtvögel",
    "Falconiformes – Falken",
    "Psittaciformes – Papageien",
    "Passeriformes – Sperlingsvögel",
  ],
  Amphibie: ["Schwanzlurche (Caudata)", "Froschlurche (Anura)"],
  Reptil: ["Testudines", "Sauria", "Serpentes"],
  Insekt: [
    "Schmetterlinge (Lepidoptera)",
    "Käfer (Coleoptera)",
    "Libellen (Odonata)",
    "Hautflügler (Hymenoptera)",
    "Heuschrecken (Orthoptera)",
    "Schnabelkerfe (Hemiptera)",
    "Zweiflügler (Diptera)",
    "Netzflügler (Neuroptera)",
    "Ohrwürmer (Dermaptera)",
  ],
  Arachnoid: [
    "Webspinnen (Araneae)",
    "Weberknechte (Opiliones)",
    "Zecken (Ixodida)",
    "Pseudoskorpione (Pseudoscorpiones)",
  ],
  "Sonstige Wirbellose": [
    "Landlungenschnecken (Stylommatophora)",
    "Asseln (Isopoda)",
    "Doppelfüßer (Diplopoda)",
    "Hundertfüßer (Chilopoda)",
    "Zehnfußkrebse (Decapoda)",
    "Wenigborster (Oligochaeta)",
  ],
};

export const ALL_ORDERS = Object.values(ORDERS_BY_GENUS).flat();

export const ENDANGERMENT = [
  "Nicht gefährdet",
  "Extrem selten",
  "Vorwarnliste",
  "Gefährdet",
  "Stark gefährdet",
  "Vom Aussterben bedroht",
  "Ausgestorben",
] as const;

/** `swatch` is a literal Tailwind class so the JIT sees it. */
export const COLORS = [
  { value: "black", swatch: "bg-black", dark: true },
  { value: "white", swatch: "bg-white", dark: false },
  { value: "brown", swatch: "bg-yellow-900", dark: true },
  { value: "yellow", swatch: "bg-yellow-400", dark: false },
  { value: "red", swatch: "bg-red-600", dark: true },
  { value: "green", swatch: "bg-green-600", dark: true },
  { value: "blue", swatch: "bg-blue-600", dark: true },
  { value: "purple", swatch: "bg-purple-700", dark: true },
  { value: "orange", swatch: "bg-orange-500", dark: false },
] as const;

export const COLOR_VALUES: readonly string[] = COLORS.map((color) => color.value);

export const SORT_COLUMNS = ["common_name", "size_to", "endangerment_status"] as const;
export type SortColumn = (typeof SORT_COLUMNS)[number];

export const SIZE_MIN = 0;
export const SIZE_MAX = 500;

/** URL keys that count as "a filter" (search and sort are not). */
export const FILTER_KEYS = [
  "genus",
  "order",
  "color",
  "endangerment",
  "sizeFrom",
  "sizeTo",
  "onlySeen",
  "onlyUnseen",
  "excludeRares",
  "invertebrates",
] as const;

/** Splits a comma-separated URL value and keeps only allowed entries. */
export function pickAllowed(raw: string | null, allowed: readonly string[]): string[] {
  if (!raw) return [];
  return raw.split(",").filter((value) => allowed.includes(value));
}

const LIST_KEYS = ["genus", "order", "color", "endangerment"] as const;
const FLAG_KEYS = ["onlySeen", "onlyUnseen", "excludeRares"] as const;

/**
 * Number of active filters in a URL: each selected value of a multi-value
 * filter counts once, each flag once, and the size range once.
 */
export function countActiveFilters(params: URLSearchParams): number {
  const values = LIST_KEYS.reduce(
    (total, key) => total + (params.get(key)?.split(",").filter(Boolean).length ?? 0),
    0,
  );
  const flags = FLAG_KEYS.filter((key) => params.get(key) === "true").length;
  const size = params.has("sizeFrom") || params.has("sizeTo") ? 1 : 0;
  const invertebrates = ["show", "hide"].includes(params.get("invertebrates") ?? "") ? 1 : 0;
  return values + flags + size + invertebrates;
}
