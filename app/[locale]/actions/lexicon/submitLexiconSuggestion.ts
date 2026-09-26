"use server";

import type { Json } from "@/utils/supabase/database.types";
import requireAuth from "@/utils/supabase/requireAuth";
import { validateImage, type ValidatedImage } from "@/utils/supabase/imageUpload";
import { checkImage } from "@/utils/moderation/checkImage";
import { worstResult } from "@/utils/moderation/verdict";
import { IMAGE_REJECTED } from "@/utils/moderation/submitImage";
import { nameTaken, parseAnimalFields, parseDescription } from "@/utils/lexicon/animalFields";
import { queueImages, removeQueuedImages, type StoredImage } from "@/utils/lexicon/animalImages";
import { fail, ok, type ActionResult } from "@/app/[locale]/utils/result";
import type { TablesInsert } from "@/utils/supabase/types";

export type SuggestionKind = "description" | "image" | "new_animal";

/**
 * Error codes the client turns into messages. Anything unexpected is
 * "failed".
 */
export type SuggestionError =
  | "invalid"
  | "notFound"
  | "consentMissing"
  | "nameTaken"
  | "limitReached"
  | "duplicate"
  | "failed"
  | typeof IMAGE_REJECTED;

const toStored = (image: ValidatedImage): StoredImage => ({
  data: image.file,
  contentType: image.contentType,
  extension: image.extension,
});

/**
 * Files a user's proposal for the lexicon: a new description or image for an
 * existing animal, or a missing animal. Everything is written with the user's
 * own session, so the row-level policies decide what is allowed (own rows
 * only, pending only, own queue folder, at most 10 open proposals).
 *
 * Images are checked first; clearly unsafe ones are refused and never stored.
 * Everything else waits for an admin.
 */
export default async function submitLexiconSuggestion(
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, user } = await requireAuth();
  const result = (error: SuggestionError) => fail(error);

  const kind = formData.get("kind");
  if (kind !== "description" && kind !== "image" && kind !== "new_animal") return result("invalid");

  let animalId: number | null = null;
  if (kind !== "new_animal") {
    animalId = Number(formData.get("animalId"));
    if (!Number.isInteger(animalId) || animalId <= 0) return result("invalid");
    const { data: animal } = await supabase
      .from("animals")
      .select("id")
      .eq("id", animalId)
      .maybeSingle();
    if (!animal) return result("notFound");
  }

  const row: TablesInsert<"lexicon_submissions"> = {
    user_id: user.id,
    kind,
    animal_id: animalId,
    data: {},
  };

  if (kind === "description") {
    const parsed = parseDescription(formData.get("description"));
    if (!parsed.ok) return result("invalid");
    row.data = { description: parsed.value };
  }

  if (kind === "new_animal") {
    let raw: unknown;
    try {
      raw = JSON.parse(String(formData.get("fields") ?? ""));
    } catch {
      return result("invalid");
    }
    const parsed = parseAnimalFields(raw);
    if (!parsed.ok) return result("invalid");
    try {
      if (await nameTaken(supabase, parsed.value.common_name)) return result("nameTaken");
    } catch (error) {
      console.error(error);
      return result("failed");
    }
    row.data = parsed.value as Json;
  }

  // An image is the point of the "image" kind and optional for a new animal.
  const hasImage = formData.get("modalFile") instanceof File;
  if (kind === "image" && !hasImage) return result("invalid");

  let queuePaths: string[] = [];
  if (hasImage) {
    if (formData.get("consent") !== "true") return result("consentMissing");
    const [thumb, main] = await Promise.all([
      validateImage(formData.get("file")),
      validateImage(formData.get("modalFile")),
    ]);
    if (!thumb || !main) return result("invalid");

    const check = worstResult(await Promise.all([thumb, main].map(checkImage)));
    if (check.verdict === "block") return result(IMAGE_REJECTED);

    try {
      queuePaths = await queueImages(supabase, user.id, {
        thumb: toStored(thumb),
        main: toStored(main),
      });
    } catch (error) {
      console.error("Error queueing lexicon image", error);
      return result("failed");
    }
    row.queue_paths = queuePaths;
    row.scores = check.scores as Json;
    row.flagged_categories = check.flagged;
  }

  const { error } = await supabase.from("lexicon_submissions").insert(row);
  if (error) {
    await removeQueuedImages(supabase, queuePaths);
    // 23505: the one-open-proposal index. 42501: the insert policy, which with
    // a well-formed row only fails on the open-proposal limit.
    if (error.code === "23505") return result("duplicate");
    if (error.code === "42501") return result("limitReached");
    console.error("Error saving lexicon suggestion", error);
    return result("failed");
  }

  return ok();
}
