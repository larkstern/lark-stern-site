/**
 * Turn any frontmatter date into a real Date, whatever shape it arrives in.
 * YAML silently parses an unquoted ISO timestamp into a Date object, a quoted
 * one stays a string, and a naive "2025-05-19T11:17" has no timezone - so accept
 * all three rather than assume one. A naive value is read as UTC (what Wix used).
 */
export function toDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  const s = String(value ?? "");
  // Bare "YYYY-MM-DDTHH:mm" with nothing after it: pin to UTC.
  return new Date(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s) ? `${s}:00Z` : s);
}

/** Formats as "12 Jun 2026" - unambiguous, and matches the site's dry register. */
export function formatDate(iso: string | Date): string {
  return toDate(iso).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
