import { GENERA } from "@/app/[locale]/utils/lexiconFilters";
import type { MapAnimal, MapAnimals, MapMarker } from "./types";

export const MIN_ENTRY_OPTIONS = [25, 50, 100, 150, 200, 250] as const;
export const MIN_UPVOTE_OPTIONS = [1, 5, 10] as const;
export const SINCE_OPTIONS = ["all", "30d", "1y"] as const;

export type Since = (typeof SINCE_OPTIONS)[number];

export type MapFilters = {
  q: string;
  animal: number | null;
  category: string | null;
  minEntries: number;
  minUpvotes: number;
  since: Since;
};

export const DEFAULT_FILTERS: MapFilters = {
  q: "",
  animal: null,
  category: null,
  minEntries: 0,
  minUpvotes: 0,
  since: "all",
};

const MAX_QUERY_LENGTH = 50;

/** Reads filters from the URL; anything unknown or malformed falls back to its default. */
export function parseFilters(params: URLSearchParams): MapFilters {
  const animal = Number(params.get("animal"));
  const category = params.get("cat");
  const minEntries = Number(params.get("minEntries"));
  const minUpvotes = Number(params.get("minUpvotes"));
  const since = params.get("since");
  return {
    q: (params.get("q") ?? "").slice(0, MAX_QUERY_LENGTH),
    animal: Number.isInteger(animal) && animal > 0 ? animal : null,
    category: category && (GENERA as readonly string[]).includes(category) ? category : null,
    minEntries: (MIN_ENTRY_OPTIONS as readonly number[]).includes(minEntries) ? minEntries : 0,
    minUpvotes: (MIN_UPVOTE_OPTIONS as readonly number[]).includes(minUpvotes) ? minUpvotes : 0,
    since: (SINCE_OPTIONS as readonly string[]).includes(since ?? "") ? (since as Since) : "all",
  };
}

/** Writes filters to query params, leaving out every value that is still the default. */
export function serializeFilters(filters: MapFilters): URLSearchParams {
  const params = new URLSearchParams();
  const q = filters.q.trim();
  if (q) params.set("q", q);
  if (filters.animal !== null) params.set("animal", String(filters.animal));
  if (filters.category) params.set("cat", filters.category);
  if (filters.minEntries > 0) params.set("minEntries", String(filters.minEntries));
  if (filters.minUpvotes > 0) params.set("minUpvotes", String(filters.minUpvotes));
  if (filters.since !== "all") params.set("since", filters.since);
  return params;
}

export function isDefaultFilters(filters: MapFilters) {
  return serializeFilters(filters).toString() === "";
}

/** How many filters differ from their default, for the badge on the phone filter button. */
export function activeFilterCount(filters: MapFilters) {
  return [...serializeFilters(filters).keys()].length;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const SINCE_DAYS: Record<Exclude<Since, "all">, number> = { "30d": 30, "1y": 365 };

export function filterLists(
  lists: MapMarker[],
  animals: MapAnimals,
  filters: MapFilters,
  now: number = Date.now(),
): MapMarker[] {
  const q = filters.q.trim().toLocaleLowerCase();
  const cutoff = filters.since === "all" ? null : now - SINCE_DAYS[filters.since] * DAY_MS;

  return lists.filter((list) => {
    if (list.entry_count < filters.minEntries) return false;
    if (list.upvotes < filters.minUpvotes) return false;
    if (cutoff !== null && new Date(list.created_at).getTime() < cutoff) return false;
    if (filters.animal !== null && !list.animal_ids.includes(filters.animal)) return false;
    if (
      filters.category &&
      !list.animal_ids.some((id) => animals[id]?.category === filters.category)
    ) {
      return false;
    }
    if (q) {
      const haystack = [list.title, list.description, list.username]
        .filter(Boolean)
        .join("\n")
        .toLocaleLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export type AnimalOption = MapAnimal & { listCount: number };

/** Animals that occur in at least one list, with how many lists contain each, most common first. */
export function animalOptions(lists: MapMarker[], animals: MapAnimals): AnimalOption[] {
  const counts = new Map<number, number>();
  for (const list of lists) {
    for (const id of list.animal_ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return [...counts]
    .flatMap(([id, listCount]) => (animals[id] ? [{ ...animals[id], listCount }] : []))
    .sort((a, b) => b.listCount - a.listCount || a.common_name.localeCompare(b.common_name));
}

/**
 * Pin colour steps, green (few animals) to red (many). Fixed thresholds so a
 * colour means the same on every visit and the legend never changes.
 * `min` is inclusive; each step runs up to the next step's `min`.
 */
export const COUNT_STEPS = [
  { min: 1, color: "#16a34a" }, // green-600
  { min: 26, color: "#65a30d" }, // lime-600
  { min: 51, color: "#ca8a04" }, // yellow-600
  { min: 101, color: "#d97706" }, // amber-600
  { min: 151, color: "#ea580c" }, // orange-600
  { min: 201, color: "#c2410c" }, // orange-700, darker to stay apart from red
  { min: 250, color: "#dc2626" }, // red-600
] as const;

export const EMPTY_COLOR = "#64748b"; // slate-500

export function countColor(count: number): string {
  let color: string = EMPTY_COLOR;
  for (const step of COUNT_STEPS) {
    if (count >= step.min) color = step.color;
  }
  return color;
}

/** Legend rows: "1–25", …, "250+". */
export function countStepLabels(): { label: string; color: string }[] {
  return COUNT_STEPS.map((step, i) => {
    const next = COUNT_STEPS[i + 1];
    return { label: next ? `${step.min}–${next.min - 1}` : `${step.min}+`, color: step.color };
  });
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

const MAX_PIN_TITLE = 22;

/**
 * Markup for a list pin (a Leaflet divIcon). The title is user input and
 * divIcon takes raw HTML, so it is escaped here.
 */
export function pinHtml(title: string, count: number, highlighted: boolean) {
  const short = title.length > MAX_PIN_TITLE ? `${title.slice(0, MAX_PIN_TITLE - 1).trimEnd()}…` : title;
  return (
    `<div class="list-pin${highlighted ? " list-pin--active" : ""}" style="--pin-color:${countColor(count)}">` +
    `<span class="list-pin__title">${escapeHtml(short)}</span>` +
    `<span class="list-pin__count">${count}</span>` +
    `</div>`
  );
}
