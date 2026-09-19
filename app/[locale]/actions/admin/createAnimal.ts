"use server";

import { revalidatePath } from "next/cache";
import requireAdmin from "@/utils/supabase/requireAdmin";
import { validateImage } from "@/utils/supabase/imageUpload";
import { fail, ok, type ActionResult } from "@/app/[locale]/utils/result";
import { nameTaken, parseAnimalFields } from "@/utils/lexicon/animalFields";
import { publishAnimalImages, removeAnimalImages } from "@/utils/lexicon/animalImages";

/**
 * Adds an animal to the lexicon straight from the admin dashboard, with an
 * optional image and whatever credit and licence the admin enters. Runs with
 * the admin's session: the insert and upload policies allow admins only.
 *
 * Error codes: "invalid", "nameTaken", "failed". On success returns the new
 * animal's name, which is its page URL.
 */
export default async function createAnimal(formData: FormData): Promise<ActionResult<string>> {
  const { supabase } = await requireAdmin();

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("fields") ?? ""));
  } catch {
    return fail("invalid");
  }
  const parsed = parseAnimalFields(raw, { allowCredit: true });
  if (!parsed.ok) return fail("invalid");

  try {
    if (await nameTaken(supabase, parsed.value.common_name)) return fail("nameTaken");
  } catch (error) {
    console.error(error);
    return fail("failed");
  }

  let images: Awaited<ReturnType<typeof publishAnimalImages>> | null = null;
  if (formData.get("modalFile") instanceof File) {
    const [thumb, main] = await Promise.all([
      validateImage(formData.get("file")),
      validateImage(formData.get("modalFile")),
    ]);
    if (!thumb || !main) return fail("invalid");
    try {
      images = await publishAnimalImages(supabase, parsed.value.category, {
        thumb: { data: thumb.file, contentType: thumb.contentType, extension: thumb.extension },
        main: { data: main.file, contentType: main.contentType, extension: main.extension },
      });
    } catch (error) {
      console.error("Error uploading animal images", error);
      return fail("failed");
    }
  }

  const { error } = await supabase.from("animals").insert({
    ...parsed.value,
    image_link: images?.image_link ?? null,
    lexicon_link: images?.lexicon_link ?? null,
  });
  if (error) {
    console.error("Error creating animal", error);
    if (images) await removeAnimalImages(supabase, images.paths);
    return fail(error.code === "23505" ? "nameTaken" : "failed");
  }

  revalidatePath("/", "layout");
  return ok(parsed.value.common_name);
}
