/**
 * @jest-environment node
 */
import {
  COUNT_STEPS,
  DEFAULT_FILTERS,
  EMPTY_COLOR,
  activeFilterCount,
  animalOptions,
  countColor,
  countStepLabels,
  filterLists,
  parseFilters,
  pinHtml,
  serializeFilters,
  type MapFilters,
} from "@/app/[locale]/components/listsmap/filterLists";
import type { MapAnimals, MapMarker } from "@/app/[locale]/components/listsmap/types";

const NOW = Date.parse("2026-09-19T12:00:00Z");
const daysAgo = (days: number) => new Date(NOW - days * 24 * 60 * 60 * 1000).toISOString();

const animals: MapAnimals = {
  1: { id: 1, common_name: "Rotfuchs", scientific_name: "Vulpes vulpes", category: "Säugetier", lexicon_link: null },
  2: { id: 2, common_name: "Amsel", scientific_name: "Turdus merula", category: "Vogel", lexicon_link: null },
  3: { id: 3, common_name: "Erdkröte", scientific_name: "Bufo bufo", category: "Amphibie", lexicon_link: null },
};

function list(overrides: Partial<MapMarker> & { id: string }): MapMarker {
  return {
    title: "List",
    description: null,
    entry_count: 10,
    lat: 50,
    lng: 10,
    username: "someone",
    upvotes: 0,
    created_at: daysAgo(1),
    animal_ids: [],
    ...overrides,
  };
}

const lists = [
  list({ id: "a", title: "Garden birds", animal_ids: [2], entry_count: 30, upvotes: 5, created_at: daysAgo(10) }),
  list({ id: "b", title: "Forest walk", description: "Foxes everywhere", animal_ids: [1, 2], entry_count: 120, upvotes: 1, created_at: daysAgo(200) }),
  list({ id: "c", title: "Pond", username: "froglover", animal_ids: [3], entry_count: 3, created_at: daysAgo(500) }),
];

const run = (patch: Partial<MapFilters>) =>
  filterLists(lists, animals, { ...DEFAULT_FILTERS, ...patch }, NOW).map((l) => l.id);

describe("parseFilters / serializeFilters", () => {
  it("round-trips a full set of filters", () => {
    const filters: MapFilters = { q: "fox", animal: 1, category: "Vogel", minEntries: 50, minUpvotes: 5, since: "30d" };
    expect(parseFilters(serializeFilters(filters))).toEqual(filters);
  });

  it("leaves defaults out of the URL", () => {
    expect(serializeFilters(DEFAULT_FILTERS).toString()).toBe("");
  });

  it("counts active filters", () => {
    expect(activeFilterCount(DEFAULT_FILTERS)).toBe(0);
    expect(activeFilterCount({ ...DEFAULT_FILTERS, q: "  ", animal: 1, since: "30d" })).toBe(2);
  });

  it("falls back to defaults for bad input", () => {
    const params = new URLSearchParams("animal=abc&cat=Fish&minEntries=7&minUpvotes=-1&since=forever");
    expect(parseFilters(params)).toEqual(DEFAULT_FILTERS);
  });
});

describe("filterLists", () => {
  it("returns everything with default filters", () => {
    expect(run({})).toEqual(["a", "b", "c"]);
  });

  it("matches text against title, description and username", () => {
    expect(run({ q: "garden" })).toEqual(["a"]);
    expect(run({ q: "FOXES" })).toEqual(["b"]);
    expect(run({ q: "frog" })).toEqual(["c"]);
  });

  it("filters by animal and by category", () => {
    expect(run({ animal: 2 })).toEqual(["a", "b"]);
    expect(run({ category: "Säugetier" })).toEqual(["b"]);
  });

  it("applies thresholds and the date cutoff", () => {
    expect(run({ minEntries: 100 })).toEqual(["b"]);
    expect(run({ minUpvotes: 5 })).toEqual(["a"]);
    expect(run({ since: "30d" })).toEqual(["a"]);
    expect(run({ since: "1y" })).toEqual(["a", "b"]);
  });

  it("combines filters", () => {
    expect(run({ animal: 2, since: "1y", minUpvotes: 1, q: "forest" })).toEqual(["b"]);
  });
});

describe("animalOptions", () => {
  it("counts lists per animal, most common first", () => {
    expect(animalOptions(lists, animals).map((a) => [a.common_name, a.listCount])).toEqual([
      ["Amsel", 2],
      ["Erdkröte", 1],
      ["Rotfuchs", 1],
    ]);
  });
});

describe("countColor", () => {
  const [green, lime, yellow, amber, orange, deepOrange, red] = COUNT_STEPS.map((s) => s.color);
  it.each([
    [0, EMPTY_COLOR],
    [1, green],
    [25, green],
    [26, lime],
    [50, lime],
    [51, yellow],
    [100, yellow],
    [101, amber],
    [150, amber],
    [151, orange],
    [200, orange],
    [201, deepOrange],
    [249, deepOrange],
    [250, red],
    [5000, red],
  ])("%i entries -> %s", (count, color) => {
    expect(countColor(count)).toBe(color);
  });

  it("labels the legend ranges", () => {
    expect(countStepLabels().map((s) => s.label)).toEqual([
      "1–25",
      "26–50",
      "51–100",
      "101–150",
      "151–200",
      "201–249",
      "250+",
    ]);
  });
});

describe("pinHtml", () => {
  it("escapes the title", () => {
    const html = pinHtml(`<img src=x onerror="alert(1)">`, 3, false);
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });

  it("truncates long titles and marks the active pin", () => {
    const html = pinHtml("A very long list title that goes on", 12, true);
    expect(html).toContain("…");
    expect(html).toContain("list-pin--active");
    expect(html).toContain(">12<");
  });
});
