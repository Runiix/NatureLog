import { seededIndex } from "@/app/[locale]/utils/seededIndex";

const TARGETS = [
  "songbird",
  "raptor",
  "waterbird",
  "mammal",
  "reptile",
  "amphibian",
  "insect",
  "spider",
  "snail",
] as const;

type Target = (typeof TARGETS)[number];

const INVERTEBRATE_TARGETS: readonly Target[] = ["insect", "spider", "snail"];

/** The target for a day (`YYYY-MM-DD`); the same for everyone with the same setting. */
export function targetForDay(day: string, hideInvertebrates: boolean): Target {
  const targets = hideInvertebrates
    ? TARGETS.filter((target) => !INVERTEBRATE_TARGETS.includes(target))
    : TARGETS;
  return targets[seededIndex(`challenge:${day}`, targets.length)];
}
