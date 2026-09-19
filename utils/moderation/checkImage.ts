import "server-only";
import type { ValidatedImage } from "@/utils/supabase/imageUpload";
import {
  classifyScores,
  flaggedCategories,
  type CategoryScores,
  type Verdict,
} from "./verdict";

export type ModerationResult = {
  verdict: Verdict;
  /** Null when the check could not run. */
  scores: CategoryScores | null;
  flagged: string[];
};

const ENDPOINT = "https://api.openai.com/v1/moderations";
const TIMEOUT_MS = 8000;
const RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 3000;

/** Result used whenever the check itself fails: an admin has to look. */
const UNCHECKED: ModerationResult = {
  verdict: "review",
  scores: null,
  flagged: ["unchecked"],
};

type ModerationResponse = {
  results?: { flagged?: boolean; category_scores?: CategoryScores }[];
};

/**
 * Scores an image with OpenAI's free omni-moderation model. Any failure (no
 * key, timeout, error response) returns "review" so the image is quarantined
 * rather than let through unchecked.
 */
export async function checkImage(image: ValidatedImage): Promise<ModerationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set; image sent to review");
    return UNCHECKED;
  }

  try {
    const base64 = Buffer.from(await image.file.arrayBuffer()).toString("base64");
    const request = () =>
      fetch(ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "omni-moderation-latest",
          input: [
            {
              type: "image_url",
              image_url: { url: `data:${image.contentType};base64,${base64}` },
            },
          ],
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

    let response = await request();
    // One retry for a short rate-limit burst; a persistent 429 (e.g. an account
    // without billing) still ends in review.
    if (response.status === 429) {
      const retryAfter = Number(response.headers?.get("retry-after"));
      const waitMs = Math.min(
        Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : RETRY_DELAY_MS,
        MAX_RETRY_DELAY_MS,
      );
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      response = await request();
    }
    if (!response.ok) {
      console.error("Image moderation failed", response.status, await response.text());
      return UNCHECKED;
    }

    const body = (await response.json()) as ModerationResponse;
    const result = body.results?.[0];
    if (!result?.category_scores) return UNCHECKED;

    const scores = result.category_scores;
    return {
      verdict: classifyScores(scores, result.flagged === true),
      scores,
      flagged: flaggedCategories(scores),
    };
  } catch (error) {
    console.error("Image moderation request failed", error);
    return UNCHECKED;
  }
}
