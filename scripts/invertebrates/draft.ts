/**
 * Step 2 of the invertebrate import: merges out/facts.json with the texts
 * written for each species (out/authored/*.json, keyed by iNaturalist taxon
 * id) into out/draft.csv for review. Rows with an "x" in `keep` are imported;
 * spares start empty and can be swapped in.
 *
 *   npm run inverts:draft
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DRAFT_FILE, FACTS_FILE, OUT_DIR } from "./config";
import { toCsv } from "./csv";
import type { Fact } from "./fetch";

export const DRAFT_COLUMNS = [
  "keep",
  "common_name",
  "scientific_name",
  "category",
  "taxonomic_order",
  "description",
  "habitat",
  "population_estimate",
  "endangerment_status",
  "size_from",
  "size_to",
  "colors",
  "sexual_dimorphism",
  "presence_time",
  "similar_animals",
  "very_rare",
  "image_credit_text",
  "image_credit_link",
  "image_license_text",
  "image_license_link",
  "photo_url",
  "inat_taxon_id",
  "observations",
  "wikipedia_url",
] as const;

type Authored = Partial<
  Record<"common_name" | "description" | "habitat" | "size_from" | "size_to" | "colors" | "sexual_dimorphism", string | number>
> & {
  /** Swaps a spare in (true) or a ranked species out (false). */
  keep?: boolean;
};

async function readAuthored(): Promise<Record<string, Authored>> {
  const dir = path.join(OUT_DIR, "authored");
  const files = await readdir(dir).catch(() => [] as string[]);
  const merged: Record<string, Authored> = {};
  for (const file of files.filter((name) => name.endsWith(".json")).sort()) {
    Object.assign(merged, JSON.parse(await readFile(path.join(dir, file), "utf8")));
  }
  return merged;
}

async function main() {
  const facts = JSON.parse(await readFile(FACTS_FILE, "utf8")) as Fact[];
  const authored = await readAuthored();

  const rows = facts.map((fact) => {
    const text = authored[String(fact.inat_taxon_id)] ?? {};
    return {
      keep: (text.keep ?? fact.keep) ? "x" : "",
      common_name: String(text.common_name ?? fact.common_name),
      scientific_name: fact.scientific_name,
      category: fact.category,
      taxonomic_order: fact.order,
      description: String(text.description ?? ""),
      habitat: String(text.habitat ?? ""),
      population_estimate: "Nicht bekannt",
      endangerment_status: fact.endangerment_status ?? "",
      size_from: String(text.size_from ?? ""),
      size_to: String(text.size_to ?? ""),
      colors: String(text.colors ?? ""),
      sexual_dimorphism: String(text.sexual_dimorphism ?? ""),
      presence_time: fact.presence_time ?? "",
      similar_animals: fact.similar_animals.join(","),
      very_rare: "false",
      image_credit_text: fact.photo?.credit_text ?? "",
      image_credit_link: fact.photo?.credit_link ?? "",
      image_license_text: fact.photo?.license_text ?? "",
      image_license_link: fact.photo?.license_link ?? "",
      photo_url: fact.photo?.url ?? "",
      inat_taxon_id: String(fact.inat_taxon_id),
      observations: String(fact.observations),
      wikipedia_url: fact.wikipedia?.url ?? "",
    };
  });

  await writeFile(DRAFT_FILE, toCsv(DRAFT_COLUMNS, rows));
  const missing = rows.filter((row) => row.keep && !row.description).length;
  console.log(`Wrote ${rows.length} rows to ${DRAFT_FILE} (${missing} kept rows still without a description)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
