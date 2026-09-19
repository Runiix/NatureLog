"use server";

import { revalidatePath } from "next/cache";
import type { Json } from "@/utils/supabase/database.types";
import requireAdmin from "@/utils/supabase/requireAdmin";
import { fail, ok } from "@/app/[locale]/utils/result";
import {
  nameTaken,
  parseAnimalFields,
  parseDescription,
  type AnimalFormValues,
} from "@/utils/lexicon/animalFields";
import {
  USER_PHOTO_LICENSE,
  downloadQueuedImages,
  publishAnimalImages,
  removeAnimalImages,
  removeQueuedImages,
} from "@/utils/lexicon/animalImages";
import type { TablesUpdate, TypedSupabaseClient } from "@/utils/supabase/types";

/** What the admin changed in the proposal before approving it. */
export type ApproveEdits = {
  description?: string;
  fields?: AnimalFormValues;
};

type Published = { image_link: string; lexicon_link: string; paths: string[] };

const asObject = (value: Json): Record<string, Json | undefined> =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

/** The contributor is credited by username, linking to their profile. */
async function creditFor(supabase: TypedSupabaseClient, userId: string) {
  const { data } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();
  const name = data?.display_name ?? null;
  return {
    image_credit_text: name ?? "Naturelog",
    image_credit_link: name ? `/profilepage/${encodeURIComponent(name)}` : null,
    ...USER_PHOTO_LICENSE,
  };
}

/**
 * Applies an open proposal to the lexicon, with the admin's edits, and marks
 * it approved. Runs with the admin's own session, so the animals, storage and
 * submission policies are what allow each write. Images uploaded for the
 * change are removed again if the animal write fails.
 */
export default async function approveLexiconSubmission(id: string, edits: ApproveEdits = {}) {
  const { supabase } = await requireAdmin();

  const { data: row } = await supabase
    .from("lexicon_submissions")
    .select("*")
    .match({ id, status: "pending" })
    .maybeSingle();
  if (!row) return fail("Suggestion not found");

  const proposed = asObject(row.data);
  let published: Published | null = null;
  const publish = async (category: string | null | undefined) => {
    if (row.queue_paths.length === 0) return null;
    const images = await downloadQueuedImages(supabase, row.queue_paths);
    published = await publishAnimalImages(supabase, category, images);
    return published;
  };
  const undoPublish = () => (published ? removeAnimalImages(supabase, published.paths) : undefined);

  let finalData: Json;
  let previous: Json = null;

  try {
    if (row.kind === "description" || row.kind === "image") {
      const { data: animal } = await supabase
        .from("animals")
        .select("*")
        .eq("id", row.animal_id ?? -1)
        .maybeSingle();
      if (!animal) return fail("Animal not found");

      let update: TablesUpdate<"animals">;
      if (row.kind === "description") {
        const parsed = parseDescription(edits.description ?? proposed.description);
        if (!parsed.ok) return fail("Invalid description");
        update = { description: parsed.value };
        previous = { description: animal.description };
      } else {
        const images = await publish(animal.category);
        if (!images) return fail("The suggestion has no image");
        update = {
          image_link: images.image_link,
          lexicon_link: images.lexicon_link,
          ...(await creditFor(supabase, row.user_id)),
        };
        previous = {
          image_link: animal.image_link,
          lexicon_link: animal.lexicon_link,
          image_credit_text: animal.image_credit_text,
          image_credit_link: animal.image_credit_link,
          image_license_text: animal.image_license_text,
          image_license_link: animal.image_license_link,
        };
      }

      // An update the policy refuses changes no rows rather than erroring.
      const { data: updated, error } = await supabase
        .from("animals")
        .update(update)
        .eq("id", animal.id)
        .select("id")
        .maybeSingle();
      if (error || !updated) {
        console.error("Error updating animal", error);
        await undoPublish();
        return fail("Could not update the animal");
      }
      finalData = update as Json;
    } else {
      const parsed = parseAnimalFields(edits.fields ?? proposed);
      if (!parsed.ok) return fail("Invalid animal fields");
      if (await nameTaken(supabase, parsed.value.common_name)) {
        return fail("An animal with this name already exists");
      }

      const images = await publish(parsed.value.category);
      const insert = images
        ? {
            ...parsed.value,
            image_link: images.image_link,
            lexicon_link: images.lexicon_link,
            ...(await creditFor(supabase, row.user_id)),
          }
        : parsed.value;

      const { error } = await supabase.from("animals").insert(insert);
      if (error) {
        console.error("Error inserting animal", error);
        await undoPublish();
        return fail("Could not create the animal");
      }
      finalData = insert as Json;
    }
  } catch (error) {
    console.error("Error applying lexicon suggestion", error);
    await undoPublish();
    return fail("Could not apply the suggestion");
  }

  // reviewed_by and reviewed_at are stamped by a trigger.
  const { data: decided, error } = await supabase
    .from("lexicon_submissions")
    .update({ status: "approved", data: finalData, previous, queue_paths: [] })
    .eq("id", row.id)
    .select("id")
    .maybeSingle();
  if (error || !decided) console.error("Error marking lexicon suggestion approved", error);

  await removeQueuedImages(supabase, row.queue_paths);
  revalidatePath("/", "layout");
  return ok();
}
