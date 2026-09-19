export type Verdict = "pass" | "review" | "block";

/** Category name → score between 0 and 1, as returned by OpenAI moderation. */
export type CategoryScores = Record<string, number>;

/**
 * All thresholds in one place. Nature photos regularly show predators and
 * prey, so plain `violence` is only ever sent to review, never blocked.
 */
export const THRESHOLDS = {
  /** A score above this blocks the upload outright. */
  block: {
    "sexual/minors": 0.2,
    sexual: 0.8,
    "violence/graphic": 0.9,
    "self-harm": 0.8,
    "self-harm/intent": 0.8,
    "self-harm/instructions": 0.8,
  } as Record<string, number>,
  /** Any category above this sends the image to an admin. */
  review: 0.3,
};

/**
 * Turns moderation scores into a decision. `flagged` is OpenAI's own verdict;
 * when it is set the image is never passed automatically.
 */
export function classifyScores(scores: CategoryScores, flagged = false): Verdict {
  const blocked = Object.entries(THRESHOLDS.block).some(
    ([category, limit]) => (scores[category] ?? 0) > limit,
  );
  if (blocked) return "block";

  const suspicious = Object.values(scores).some((score) => score > THRESHOLDS.review);
  if (flagged || suspicious) return "review";

  return "pass";
}

/** Categories above the review threshold, highest first, for the admin view. */
export function flaggedCategories(scores: CategoryScores): string[] {
  return Object.entries(scores)
    .filter(([, score]) => score > THRESHOLDS.review)
    .sort(([, a], [, b]) => b - a)
    .map(([category]) => category);
}
