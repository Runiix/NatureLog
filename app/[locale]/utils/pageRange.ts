/**
 * Inclusive row range for a client-supplied page. The values arrive from the
 * browser, so they are clamped: no negative, fractional, NaN or huge pages.
 */
export function pageRange(offset: number, pageSize: number, maxPageSize = 50) {
  const size = Math.min(Math.max(1, Math.trunc(pageSize) || 1), maxPageSize);
  const from = Math.max(0, Math.trunc(offset) || 0) * size;
  return { from, to: from + size - 1 };
}
