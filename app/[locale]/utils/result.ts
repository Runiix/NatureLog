/**
 * Return shape for server actions, so callers can tell "it failed" apart from
 * "it succeeded with nothing" — the old convention of logging and returning
 * `[]` made every empty state indistinguishable from an error.
 *
 * The discriminant is `success` because that is what existing call sites
 * already check.
 */
export type ActionResult<T = null> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };

export const ok = <T = null>(data: T = null as T): ActionResult<T> => ({
  success: true,
  data,
  error: null,
});

export const fail = <T = null>(error: string): ActionResult<T> => ({
  success: false,
  data: null,
  error,
});
