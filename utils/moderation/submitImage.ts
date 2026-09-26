import "server-only";
import type { Json } from "@/utils/supabase/database.types";
import { createAdminClient } from "@/utils/supabase/admin";
import type { ValidatedImage } from "@/utils/supabase/imageUpload";
import { checkImage } from "./checkImage";
import { worstResult } from "./verdict";
import { publishImage, type ImageFile, type ImageKind, type PublishPayload } from "./publish";

export const QUEUE_BUCKET = "moderation_queue";

/** Error code the client turns into the "image rejected" message. */
export const IMAGE_REJECTED = "imageRejected";

export type SubmitOutcome =
  | { ok: true; status: "approved" | "pending" }
  | { ok: false; error: string };

const toImageFile = (image: ValidatedImage): ImageFile => ({
  data: image.file,
  contentType: image.contentType,
  extension: image.extension,
});

/**
 * The one way an uploaded image reaches the `profiles` bucket. The image is
 * checked first; then it is
 * - published at once when it passes,
 * - quarantined for an admin when it is borderline or could not be checked,
 * - refused when it is clearly unsafe.
 *
 * Every file is scored; the most severe result decides.
 */
export async function submitModeratedImage({
  kind,
  userId,
  files,
  payload,
}: {
  kind: ImageKind;
  userId: string;
  files: ValidatedImage[];
  payload: PublishPayload;
}): Promise<SubmitOutcome> {
  const result = worstResult(await Promise.all(files.map(checkImage)));
  if (result.verdict === "block") return { ok: false, error: IMAGE_REJECTED };

  const admin = createAdminClient();
  const imageFiles = files.map(toImageFile);
  const record = {
    user_id: userId,
    kind,
    scores: result.scores as Json,
    flagged_categories: result.flagged,
  };

  try {
    if (result.verdict === "pass") {
      const livePaths = await publishImage(kind, admin, userId, imageFiles, payload);

      // A profile picture or collection photo overwrites the previous object
      // at the same path, so older records for that path describe an image
      // that no longer exists.
      await admin
        .from("image_moderation")
        .delete()
        .eq("user_id", userId)
        .eq("status", "approved")
        .overlaps("live_paths", livePaths);

      const { error } = await admin.from("image_moderation").insert({
        ...record,
        status: "approved",
        decided_by: "auto",
        live_paths: livePaths,
        payload: payload as Json,
      });
      if (error) console.error("Error recording approved image", error);
      return { ok: true, status: "approved" };
    }

    const queuePaths = imageFiles.map(
      (file) => `${userId}/${crypto.randomUUID()}.${file.extension}`,
    );
    const uploads = await Promise.all(
      imageFiles.map((file, index) =>
        admin.storage.from(QUEUE_BUCKET).upload(queuePaths[index], file.data, {
          contentType: file.contentType,
        }),
      ),
    );
    const uploadError = uploads.find((upload) => upload.error)?.error;
    if (uploadError) {
      await admin.storage.from(QUEUE_BUCKET).remove(queuePaths);
      throw new Error(`Quarantine upload failed: ${uploadError.message}`);
    }

    const { error } = await admin.from("image_moderation").insert({
      ...record,
      status: "pending",
      decided_by: "auto",
      queue_paths: queuePaths,
      payload: payload as Json,
    });
    if (error) {
      await admin.storage.from(QUEUE_BUCKET).remove(queuePaths);
      throw new Error(`Recording pending image failed: ${error.message}`);
    }
    return { ok: true, status: "pending" };
  } catch (error) {
    console.error("Moderated upload failed", error);
    return { ok: false, error: "Upload failed" };
  }
}
