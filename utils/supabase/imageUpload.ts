/**
 * Every image the app stores is compressed in the browser first (≤ 0.2 MB), so
 * 2 MB leaves plenty of headroom while still refusing anything that skipped
 * the client — which is exactly the traffic a server-side check is for.
 */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type ImageType = keyof typeof IMAGE_TYPES;

export type ValidatedImage = {
  file: File;
  contentType: ImageType;
  extension: (typeof IMAGE_TYPES)[ImageType];
};

/** Reads the file's leading bytes; the declared MIME type is client-controlled. */
async function sniffImageType(file: File): Promise<ImageType | null> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...bytes.slice(start, end));

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes[0] === 0x89 &&
    ascii(1, 4) === "PNG" &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a
  ) {
    return "image/png";
  }
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return "image/webp";
  }
  return null;
}

/**
 * Accepts a FormData entry only if it is a non-empty JPEG, PNG or WebP within
 * the size cap, judged by its content rather than its declared type. The
 * returned contentType is what the object should be stored with, so the bucket
 * never serves a client-chosen type.
 */
export async function validateImage(
  value: FormDataEntryValue | null,
): Promise<ValidatedImage | null> {
  if (!(value instanceof File)) return null;
  if (value.size === 0 || value.size > MAX_IMAGE_BYTES) return null;

  const contentType = await sniffImageType(value);
  if (!contentType) return null;

  return { file: value, contentType, extension: IMAGE_TYPES[contentType] };
}
