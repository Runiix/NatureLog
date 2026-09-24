import { targetForDay } from "@/app/[locale]/components/home/DailyChallenge";
import filterSpottedAnimals from "@/app/[locale]/utils/filterSpottedAnimals";
import {
  countActiveFilters,
  GENERA,
  isInvertebrate,
  showsInvertebrates,
} from "@/app/[locale]/utils/lexiconFilters";

describe("invertebrate switch", () => {
  test("the URL value wins, otherwise the user's setting decides", () => {
    expect(showsInvertebrates("show", true)).toBe(true);
    expect(showsInvertebrates("hide", false)).toBe(false);
    expect(showsInvertebrates(null, false)).toBe(true);
    expect(showsInvertebrates(null, true)).toBe(false);
    expect(showsInvertebrates("garbage", true)).toBe(false);
  });

  test("an explicit switch value counts as one active filter", () => {
    expect(countActiveFilters(new URLSearchParams("invertebrates=hide"))).toBe(1);
    expect(countActiveFilters(new URLSearchParams("invertebrates=nope"))).toBe(0);
  });

  test("the three invertebrate groups are recognised", () => {
    expect(GENERA.filter(isInvertebrate)).toEqual(["Insekt", "Arachnoid", "Sonstige Wirbellose"]);
    expect(isInvertebrate(null)).toBe(false);
  });
});

describe("daily challenge", () => {
  const days = Array.from({ length: 366 }, (_, i) =>
    new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10),
  );

  test("never picks an invertebrate target for users who hide them", () => {
    const picks = new Set(days.map((day) => targetForDay(day, true)));
    expect([...picks].some((target) => ["insect", "spider", "snail"].includes(target))).toBe(false);
  });

  test("everyone else also gets invertebrate targets", () => {
    const picks = new Set(days.map((day) => targetForDay(day, false)));
    expect(picks.has("insect") || picks.has("spider") || picks.has("snail")).toBe(true);
  });
});

describe("collection group progress", () => {
  test("counts sightings and totals per group, by name rather than position", () => {
    const progress = filterSpottedAnimals(
      [{ category: "Vogel" }, { category: "Vogel" }, { category: "Sonstige Wirbellose" }],
      { Vogel: 300, "Sonstige Wirbellose": 20, all: 700 },
    );
    expect(progress).toHaveLength(GENERA.length);
    expect(progress.find((group) => group.value === "Vogel")).toEqual({
      value: "Vogel",
      spottedCount: 2,
      count: 300,
    });
    expect(progress.find((group) => group.value === "Sonstige Wirbellose")?.spottedCount).toBe(1);
    expect(progress.find((group) => group.value === "Reptil")?.count).toBe(0);
  });
});
