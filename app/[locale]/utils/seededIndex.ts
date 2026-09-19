/**
 * Deterministic index in [0, length) for a seed string (FNV-1a hash), so a
 * "pick of the day" is stable for everyone for that day. The old
 * sum-of-char-codes seed gave neighbouring days neighbouring values.
 */
export function seededIndex(seed: string, length: number): number {
  if (length <= 0) return 0;
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) % length;
}
