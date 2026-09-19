/**
 * @jest-environment node
 */
import {
  ANIMAL_GROUPS,
  achievementScore,
  buildActivity,
  tiered,
  computeAchievements,
  type SightingFacts,
} from "@/app/[locale]/utils/achievements";

const sighting = (overrides: Partial<SightingFacts> = {}): SightingFacts => ({
  category: "Vogel",
  veryRare: false,
  endangerment: "Nicht gefährdet",
  hasPhoto: false,
  ...overrides,
});

const byId = (sightings: SightingFacts[], publicLists = 0) =>
  Object.fromEntries(computeAchievements({ sightings, publicLists }).map((a) => [a.id, a]));

describe("tiered", () => {
  test("below bronze has no tier and bronze is next", () => {
    expect(tiered("sightings", 9)).toMatchObject({
      tier: null,
      tiersEarned: 0,
      next: { tier: "bronze", target: 10 },
    });
  });

  test("each threshold unlocks the next tier exactly", () => {
    const tiers = [10, 50, 100, 200, 350].map((n) => tiered("sightings", n).tier);
    expect(tiers).toEqual(["bronze", "silver", "gold", "platinum", "diamond"]);
    expect(tiered("sightings", 49)).toMatchObject({ tier: "bronze", next: { tier: "silver", target: 50 } });
  });

  test("rare and endangered use 1, 5, 10, 20, 50", () => {
    expect(tiered("rare", 1).tier).toBe("bronze");
    expect(tiered("rare", 20).tier).toBe("platinum");
    expect(tiered("endangered", 49)).toMatchObject({ tier: "platinum", next: { target: 50 } });
  });

  test("diamond has no next tier", () => {
    expect(tiered("photos", 1000)).toMatchObject({ tier: "diamond", tiersEarned: 5, next: null, count: 1000 });
  });
});

describe("computeAchievements", () => {
  test("a new user has earned nothing", () => {
    const all = computeAchievements({ sightings: [], publicLists: 0 });
    expect(achievementScore(all)).toEqual({ earned: 0, total: 22 });
  });

  test("tracks count the right sightings", () => {
    const result = byId(
      [
        ...Array.from({ length: 5 }, () => sighting({ veryRare: true })),
        sighting({ endangerment: "Vom Aussterben bedroht" }),
        sighting({ endangerment: "Gefährdet" }), // merely endangered does not count
        ...Array.from({ length: 10 }, () => sighting({ hasPhoto: true })),
      ],
      1,
    );
    expect(result.sightings).toMatchObject({ count: 17, tier: "bronze" });
    expect(result.photos).toMatchObject({ count: 10, tier: "bronze" });
    expect(result.rare).toMatchObject({ count: 5, tier: "silver" });
    expect(result.endangered).toMatchObject({ count: 1, tier: "bronze" });
    expect(result.listMaker).toMatchObject({ earned: true });
  });

  test("all groups needs one sighting in each of the six groups", () => {
    const five = ANIMAL_GROUPS.slice(0, 5).map((category) => sighting({ category }));
    expect(byId(five).allGroups).toMatchObject({ earned: false, progress: 5 });
    const six = ANIMAL_GROUPS.map((category) => sighting({ category }));
    expect(byId(six).allGroups).toMatchObject({ earned: true });
    // Unknown or missing categories do not count.
    expect(
      byId([...five, sighting({ category: null }), sighting({ category: "Fisch" })]).allGroups,
    ).toMatchObject({ earned: false });
  });

  test("score counts every tier plus one-off badges", () => {
    const all = computeAchievements({
      sightings: Array.from({ length: 60 }, () => sighting({ veryRare: true })),
      publicLists: 1,
    });
    // sightings silver (2) + rare diamond (5) + curator (1)
    expect(achievementScore(all)).toEqual({ earned: 8, total: 22 });
  });
});

describe("buildActivity", () => {
  const rows = [
    { animal: "Eisvogel", first_spotted_at: "2026-05-01", image: true, image_updated_at: "2026-06-10T09:00:00Z" },
    { animal: "Luchs", first_spotted_at: "2026-07-20", image: false, image_updated_at: null },
    { animal: "Dachs", first_spotted_at: null, image: false, image_updated_at: null },
    { animal: "Kröte", first_spotted_at: "not a date", image: null, image_updated_at: null },
  ];

  test("interleaves sightings and photos newest first", () => {
    expect(buildActivity(rows)).toEqual([
      { kind: "sighting", animal: "Luchs", at: "2026-07-20" },
      { kind: "photo", animal: "Eisvogel", at: "2026-06-10T09:00:00Z" },
      { kind: "sighting", animal: "Eisvogel", at: "2026-05-01" },
    ]);
  });

  test("respects the limit", () => {
    expect(buildActivity(rows, 1)).toHaveLength(1);
  });
});
