/**
 * Escapes LIKE/ILIKE wildcards so user search input matches literally:
 * searching "50%" should not mean "50 followed by anything".
 */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}
