/**
 * Profile achievements, derived from data NatureLog already stores — no new
 * tables. Pure, so the thresholds are unit-tested and the profile page only
 * has to gather the inputs.
 */
import { GENERA } from "./lexiconFilters";

export type SightingFacts = {
  category: string | null;
  veryRare: boolean;
  endangerment: string | null;
  hasPhoto: boolean;
};

export type AchievementInput = {
  sightings: SightingFacts[];
  publicLists: number;
};

export const TIERS = ["bronze", "silver", "gold", "platinum", "diamond"] as const;
export type Tier = (typeof TIERS)[number];

/** Thresholds per tier, bronze to diamond. */
export const TRACKS = {
  sightings: [10, 50, 100, 200, 350],
  photos: [10, 50, 100, 200, 350],
  rare: [1, 5, 10, 20, 50],
  endangered: [1, 5, 10, 20, 50],
} as const satisfies Record<string, readonly number[]>;
export type TrackId = keyof typeof TRACKS;

/** A badge that levels up through the five tiers. */
export type TieredAchievement = {
  kind: "tiered";
  id: TrackId;
  count: number;
  /** Highest tier reached, or null below bronze. */
  tier: Tier | null;
  /** Number of tiers reached (0–5). */
  tiersEarned: number;
  /** The next tier and what it takes, or null once diamond is reached. */
  next: { tier: Tier; target: number } | null;
};

/** A one-off badge. */
export type SingleAchievement = {
  kind: "single";
  id: "allGroups" | "listMaker";
  earned: boolean;
  progress: number;
  target: number;
};

export type Achievement = TieredAchievement | SingleAchievement;

/** The seven animal groups in the lexicon (values of animals.category). */
export const ANIMAL_GROUPS: readonly string[] = GENERA;
const ENDANGERED = new Set(["Stark gefährdet", "Vom Aussterben bedroht"]);

export function tiered(id: TrackId, count: number): TieredAchievement {
  const thresholds = TRACKS[id];
  const tiersEarned = thresholds.filter((threshold) => count >= threshold).length;
  return {
    kind: "tiered",
    id,
    count,
    tier: tiersEarned > 0 ? TIERS[tiersEarned - 1] : null,
    tiersEarned,
    next: tiersEarned < TIERS.length ? { tier: TIERS[tiersEarned], target: thresholds[tiersEarned] } : null,
  };
}

function single(id: SingleAchievement["id"], progress: number, target: number): SingleAchievement {
  return { kind: "single", id, earned: progress >= target, progress: Math.min(progress, target), target };
}

export function computeAchievements({ sightings, publicLists }: AchievementInput): Achievement[] {
  const groups = new Set(
    sightings.map((s) => s.category).filter((c): c is string => c !== null && ANIMAL_GROUPS.includes(c)),
  ).size;

  return [
    tiered("sightings", sightings.length),
    tiered("photos", sightings.filter((s) => s.hasPhoto).length),
    tiered("rare", sightings.filter((s) => s.veryRare).length),
    tiered(
      "endangered",
      sightings.filter((s) => s.endangerment !== null && ENDANGERED.has(s.endangerment)).length,
    ),
    single("allGroups", groups, ANIMAL_GROUPS.length),
    single("listMaker", publicLists, 1),
  ];
}

/** Earned steps across all badges: every tier counts, as does each one-off badge. */
export function achievementScore(achievements: Achievement[]) {
  let earned = 0;
  let total = 0;
  for (const a of achievements) {
    if (a.kind === "tiered") {
      earned += a.tiersEarned;
      total += TIERS.length;
    } else {
      earned += a.earned ? 1 : 0;
      total += 1;
    }
  }
  return { earned, total };
}

export type ActivityEvent = {
  kind: "sighting" | "photo";
  animal: string;
  /** ISO date or timestamp. */
  at: string;
};

type SpottedRow = {
  first_spotted_at: string | null;
  image: boolean | null;
  image_updated_at: string | null;
  animal: string;
};

/**
 * Newest-first activity: one event per dated sighting and one per photo
 * upload. `spotted` has no created_at, so undated sightings without a photo
 * cannot be placed on a timeline and are left out.
 */
export function buildActivity(rows: SpottedRow[], limit = 12): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  for (const row of rows) {
    if (row.first_spotted_at) {
      events.push({ kind: "sighting", animal: row.animal, at: row.first_spotted_at });
    }
    if (row.image && row.image_updated_at) {
      events.push({ kind: "photo", animal: row.animal, at: row.image_updated_at });
    }
  }
  return events
    .filter((event) => !Number.isNaN(Date.parse(event.at)))
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, limit);
}
