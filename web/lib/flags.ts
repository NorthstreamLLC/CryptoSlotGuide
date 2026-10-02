/**
 * A country's flag from its ISO code, as the two regional-indicator symbols
 * every platform renders as a flag emoji. No image, no request, no rights
 * question — and nothing for a code that is not a plain two-letter country
 * ("US-NJ", "CA-ON"), which returns an empty string rather than a wrong flag.
 */
export function flagOf(code: string | null | undefined): string {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return "";
  const base = 0x1f1e6 - 65;
  return String.fromCodePoint(...code.toUpperCase().split("").map((ch) => base + ch.charCodeAt(0)));
}
