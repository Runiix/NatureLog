import imageCompression from "browser-image-compression";

const THUMB = { maxSizeMB: 0.05, maxWidthOrHeight: 600, useWebWorker: true };
const FULL = { maxSizeMB: 0.4, maxWidthOrHeight: 1920, useWebWorker: true };

/**
 * Compresses a picked photo into the two sizes the lexicon stores: the grid
 * thumbnail and the banner. Appended as `file` and `modalFile`, like every
 * other upload in the app.
 */
export async function appendLexiconImage(formData: FormData, file: File) {
  const [thumb, full] = await Promise.all([
    imageCompression(file, THUMB),
    imageCompression(file, FULL),
  ]);
  formData.append("file", thumb);
  formData.append("modalFile", full);
}
