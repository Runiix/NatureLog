/**
 * The public bucket contest photos live in once they passed the image check.
 * Only the service role writes to it (no storage policies).
 */
export const CONTEST_BUCKET = "contest";

/** Object paths of an entry's two sizes, grouped by contest. */
export const contestEntryPaths = (
  contestId: string,
  entryId: string,
  extensions: { thumb: string; main: string },
) => ({
  thumb: `${contestId}/${entryId}-thumb.${extensions.thumb}`,
  main: `${contestId}/${entryId}-main.${extensions.main}`,
});
