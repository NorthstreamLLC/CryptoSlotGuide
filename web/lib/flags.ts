/**
 * Flags as files, not emoji.
 *
 * The first cut used the two regional-indicator symbols that most platforms
 * draw as a flag emoji. Windows draws them as two letters — "FI Finland" —
 * and Windows is most of our readers, so every country row showed a code,
 * not a flag. These are the MIT-licensed SVGs from flag-icons, copied into
 * public/assets/flags for the countries the law data covers (43 of them),
 * 4:3 like the menu's game tiles. flagOf() keeps the emoji for alt text and
 * for the few places that cannot take an image.
 */
const SHIPPED = new Set(["ar", "at", "au", "be", "br", "ca", "ch", "co", "cw", "cy", "cz", "de", "dk", "ee", "es", "fi", "fr", "gb", "gr", "hu", "ie", "in", "it", "jp", "ke", "kr", "lv", "mt", "mx", "nl", "no", "nz", "ph", "pl", "pt", "ro", "se", "sg", "si", "sk", "tr", "ua", "us", "za", "eu"]);

export function flagSrc(code: string | null | undefined): string | null {
  const c = (code ?? "").toLowerCase();
  return SHIPPED.has(c) ? `/assets/flags/${c}.svg` : null;
}

export function flagOf(code: string | null | undefined): string {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return "";
  const base = 0x1f1e6 - 65;
  return String.fromCodePoint(...code.toUpperCase().split("").map((ch) => base + ch.charCodeAt(0)));
}
