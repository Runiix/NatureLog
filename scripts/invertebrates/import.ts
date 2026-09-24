/**
 * Step 3 of the invertebrate import: validates out/draft.csv and, with
 * --commit, replaces every invertebrate in the lexicon with the kept rows.
 *
 *   npm run inverts:import            dry run: validate, build images, report
 *   npm run inverts:import -- --commit
 *
 * --commit is destructive: existing Insekt / Arachnoid / Sonstige Wirbellose
 * animals are deleted together with their sightings (and sighting photos),
 * list entries and lexicon suggestions. Everything deleted is written to
 * out/backup-<timestamp>.json first. Vertebrates are never touched.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import { INVERTEBRATE_GROUPS, isInvertebrate } from "@/app/[locale]/utils/lexiconFilters";
import { collectionImageName } from "@/app/[locale]/utils/storagePaths";
import { parseAnimalFields, type AnimalFields } from "@/utils/lexicon/animalFields";
import {
  ANIMAL_BUCKET,
  publishAnimalImages,
  removeAnimalImages,
  type AnimalImagePair,
  type StoredImage,
} from "@/utils/lexicon/animalStorage";
import type { Database } from "@/utils/supabase/database.types";
import type { TypedSupabaseClient } from "@/utils/supabase/types";
import { DRAFT_FILE, IMAGES_DIR, OUT_DIR } from "./config";
import { parseCsv } from "./csv";
import { download } from "./http";

const QUEUE_BUCKET = "moderation_queue";
const COMMIT = process.argv.includes("--commit");

/** Same sizes as the lexicon image picker: 1920 px banner, 600 px grid thumbnail. */
const SIZES = { main: { max: 1920, quality: 80 }, thumb: { max: 600, quality: 75 } } as const;

type Row = { fields: AnimalFields; inatId: string; photoUrl: string };

function client(): TypedSupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = COMMIT ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase URL or key missing in .env.local");
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function validate(records: Record<string, string>[]) {
  const rows: Row[] = [];
  const errors: string[] = [];
  const names = new Map<string, number>();
  const scientific = new Map<string, number>();

  for (const record of records.filter((row) => row.keep.trim() !== "")) {
    const label = record.common_name || record.scientific_name || `iNat ${record.inat_taxon_id}`;
    const parsed = parseAnimalFields(record, { allowCredit: true });
    if (!parsed.ok) {
      errors.push(`${label}: ${Object.entries(parsed.errors).map(([key, code]) => `${key} ${code}`).join(", ")}`);
      continue;
    }
    if (!isInvertebrate(parsed.value.category)) errors.push(`${label}: category must be an invertebrate group`);
    if (!parsed.value.description) errors.push(`${label}: description missing`);
    if (!record.photo_url) errors.push(`${label}: no photo`);
    names.set(parsed.value.common_name.toLowerCase(), (names.get(parsed.value.common_name.toLowerCase()) ?? 0) + 1);
    scientific.set(parsed.value.scientific_name, (scientific.get(parsed.value.scientific_name) ?? 0) + 1);
    rows.push({ fields: parsed.value, inatId: record.inat_taxon_id, photoUrl: record.photo_url });
  }

  for (const [name, count] of names) if (count > 1) errors.push(`${name}: common_name used ${count} times`);
  for (const [name, count] of scientific) if (count > 1) errors.push(`${name}: scientific_name used ${count} times`);
  return { rows, errors };
}

async function images(row: Row): Promise<AnimalImagePair<StoredImage>> {
  const original = await download(row.photoUrl, path.join(IMAGES_DIR, `${row.inatId}.orig`));
  const render = async (size: keyof typeof SIZES) => {
    const { max, quality } = SIZES[size];
    const data = await sharp(original)
      .rotate()
      .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
    await writeFile(path.join(IMAGES_DIR, `${row.inatId}-${size}.webp`), data);
    return { data: new Blob([new Uint8Array(data)], { type: "image/webp" }), contentType: "image/webp", extension: "webp" };
  };
  return { main: await render("main"), thumb: await render("thumb") };
}

/** Object path inside a bucket from its public URL. */
const objectPath = (url: string | null, bucket: string) => {
  const marker = `/object/public/${bucket}/`;
  return url?.includes(marker) ? decodeURIComponent(url.split(marker)[1]) : null;
};

const fail = (what: string, error: { message: string } | null) => {
  if (error) throw new Error(`${what}: ${error.message}`);
};

async function wipe(supabase: TypedSupabaseClient) {
  const { data: animals, error } = await supabase
    .from("animals")
    .select("*")
    .in("category", [...INVERTEBRATE_GROUPS]);
  fail("Reading invertebrates", error);
  const ids = animals!.map((animal) => animal.id);
  const names = new Map(animals!.map((animal) => [animal.id, animal.common_name]));
  if (ids.length === 0) return;

  const [spotted, listItems, submissions, moderation] = await Promise.all([
    supabase.from("spotted").select("*").in("animal_id", ids),
    supabase.from("animallistitems").select("*").in("animal_id", ids),
    supabase.from("lexicon_submissions").select("*").in("animal_id", ids),
    supabase.from("image_moderation").select("*").eq("kind", "collection").eq("status", "pending"),
  ]);
  for (const [what, result] of Object.entries({ spotted, listItems, submissions, moderation })) {
    fail(`Reading ${what}`, result.error);
  }
  const pendingPhotos = moderation.data!.filter((row) =>
    ids.includes(Number((row.payload as { animalId?: number } | null)?.animalId)),
  );

  const backup = path.join(OUT_DIR, `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  await writeFile(
    backup,
    JSON.stringify(
      { animals, spotted: spotted.data, animallistitems: listItems.data, lexicon_submissions: submissions.data, image_moderation: pendingPhotos },
      null,
      2,
    ),
  );
  console.log(`Backup: ${backup}`);

  // Sighting photos live under <user>/Collection and /CollectionModals.
  const photoPaths = spotted.data!.flatMap((row) => {
    const name = names.get(row.animal_id!);
    if (!row.image || !row.user_id || !name) return [];
    const object = collectionImageName(name);
    return [`${row.user_id}/Collection/${object}`, `${row.user_id}/CollectionModals/${object}`];
  });
  const photoUrls = photoPaths
    .filter((objectName) => objectName.includes("/Collection/"))
    .map((objectName) => supabase.storage.from("profiles").getPublicUrl(objectName).data.publicUrl);

  const queuePaths = [
    ...submissions.data!.flatMap((row) => row.queue_paths ?? []),
    ...pendingPhotos.flatMap((row) => row.queue_paths ?? []),
  ];
  const animalImagePaths = animals!.flatMap((animal) =>
    [objectPath(animal.image_link, ANIMAL_BUCKET), objectPath(animal.lexicon_link, ANIMAL_BUCKET)].filter(
      (value): value is string => value !== null,
    ),
  );

  fail("Deleting suggestions", (await supabase.from("lexicon_submissions").delete().in("animal_id", ids)).error);
  fail("Deleting list items", (await supabase.from("animallistitems").delete().in("animal_id", ids)).error);
  if (pendingPhotos.length > 0) {
    fail(
      "Deleting pending photos",
      (await supabase.from("image_moderation").delete().in("id", pendingPhotos.map((row) => row.id))).error,
    );
  }
  if (photoUrls.length > 0) {
    fail("Deleting feed images", (await supabase.from("lastimages").delete().in("image_url", photoUrls)).error);
  }
  // The spotted trigger recounts every affected user's sightings.
  fail("Deleting sightings", (await supabase.from("spotted").delete().in("animal_id", ids)).error);
  fail("Deleting animals", (await supabase.from("animals").delete().in("id", ids)).error);

  if (photoPaths.length > 0) await supabase.storage.from("profiles").remove(photoPaths);
  if (queuePaths.length > 0) await supabase.storage.from(QUEUE_BUCKET).remove(queuePaths);
  await removeAnimalImages(supabase, animalImagePaths);

  console.log(
    `Deleted ${ids.length} animals, ${spotted.data!.length} sightings, ${listItems.data!.length} list items, ` +
      `${submissions.data!.length} suggestions, ${photoPaths.length / 2} sighting photos`,
  );
}

async function insert(supabase: TypedSupabaseClient, rows: Row[]) {
  const { data: existing, error } = await supabase.from("animals").select("scientific_name");
  fail("Reading animals", error);
  const present = new Set(existing!.map((row) => row.scientific_name));

  let inserted = 0;
  for (const row of rows) {
    if (present.has(row.fields.scientific_name)) continue; // a rerun after a partial import
    const published = await publishAnimalImages(supabase, row.fields.category, await images(row));
    const { error: insertError } = await supabase.from("animals").insert({
      ...row.fields,
      image_link: published.image_link,
      lexicon_link: published.lexicon_link,
    });
    if (insertError) {
      await removeAnimalImages(supabase, published.paths);
      console.error(`${row.fields.common_name}: ${insertError.message}`);
      continue;
    }
    inserted++;
    if (inserted % 10 === 0) console.log(`inserted ${inserted}/${rows.length}`);
  }
  console.log(`Inserted ${inserted} animals`);
}

async function main() {
  const { rows, errors } = validate(parseCsv(await readFile(DRAFT_FILE, "utf8")));

  const supabase = client();
  const { data: animals, error } = await supabase.from("animals").select("common_name, category");
  fail("Reading animals", error);
  const taken = new Set(
    animals!.filter((row) => !isInvertebrate(row.category)).map((row) => row.common_name.toLowerCase()),
  );
  for (const row of rows) {
    if (taken.has(row.fields.common_name.toLowerCase())) {
      errors.push(`${row.fields.common_name}: name already used by a vertebrate`);
    }
  }

  await mkdir(IMAGES_DIR, { recursive: true });
  for (const row of rows) {
    try {
      await images(row);
    } catch (imageError) {
      errors.push(`${row.fields.common_name}: ${(imageError as Error).message}`);
    }
  }

  const perGroup = Object.fromEntries(
    INVERTEBRATE_GROUPS.map((group) => [group, rows.filter((row) => row.fields.category === group).length]),
  );
  console.log(`Kept rows: ${rows.length}`, perGroup);
  console.log(`Images: ${IMAGES_DIR}`);
  if (errors.length > 0) {
    console.error(`\n${errors.length} problem(s):\n- ${errors.join("\n- ")}`);
    process.exit(1);
  }
  if (!COMMIT) {
    console.log("\nDry run clean. Run with --commit to replace the invertebrates.");
    return;
  }

  await wipe(supabase);
  await insert(supabase, rows);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
