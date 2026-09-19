/**
 * Storage object naming, shared by the actions that write objects and the
 * pages/components that build URLs to read them back. Keeping both sides on one
 * function is what guarantees a written object is found again: the writer used
 * to strip only spaces while every reader stripped all whitespace.
 */

/** Object name for a user's photo of a species in the Collection folders. */
export function collectionImageName(commonName: string): string {
  return commonName.replace(/[äöüß\s]/g, "_") + ".jpg";
}

/**
 * True for a single path segment: no separators, no control characters, no
 * leading dot (which also rules out "." and ".." and the bucket's
 * `.emptyFolderPlaceholder`), bounded length. Anything a client sends back as
 * "the file to replace/delete" must pass this before it is joined onto the
 * caller's own folder, which keeps the result inside that folder.
 *
 * Deliberately permissive otherwise: images uploaded before names were
 * generated server-side kept their original filenames, spaces and all, and
 * users still need to be able to delete those.
 */
export function isSafeObjectName(name: unknown): name is string {
  return (
    typeof name === "string" &&
    name.length > 0 &&
    name.length <= 200 &&
    !name.startsWith(".") &&
    !name.includes("/") &&
    !name.includes("\\") &&
    ![...name].some((char) => char.charCodeAt(0) < 0x20 || char.charCodeAt(0) === 0x7f)
  );
}
