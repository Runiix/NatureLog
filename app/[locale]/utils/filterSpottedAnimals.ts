import { GENERA } from "@/app/[locale]/utils/lexiconFilters";

/** Per-group progress for the collection filter: the owner's sightings vs. the group's lexicon size. */
export default function filterSpottedAnimals(
  data: { category: string }[],
  totals: Record<string, number>,
) {
  return GENERA.map((genus) => ({
    value: genus,
    spottedCount: data.filter((item) => item.category === genus).length,
    count: totals[genus] ?? 0,
  }));
}
