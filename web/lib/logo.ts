/**
 * Single source of truth for "does this slug have a real logo file."
 * Was two duplicated `logoFor()` functions (lib/casino-index.ts,
 * lib/vertical-view.ts) that both pointed at public/assets/logos/*.png
 * — 34 files that turned out to ALL be auto-generated 2-letter
 * monogram placeholders (flat grey-blue "ST", "KR", "LG"...), not real
 * acquired brand assets, discovered and removed 10 Sep 2026. The one
 * genuine logo on the whole site is Roobet's (public/assets/roobet-logo.png,
 * the real fox mark + wordmark) — everyone else renders the site's own
 * tinted-monogram fallback via BrandMark (components/ui/BrandMark.tsx)
 * instead of a fake image, honestly, until real logo files exist.
 */
export function logoFor(slug: string): string | null {
  return slug === "roobet" ? "/assets/roobet-logo.png" : null;
}

/**
 * Deterministic fallback tint for entities with no per-item brand color
 * of their own (casinos, wallets, exchanges — providers and slots
 * already carry a real `tint` field in their data and should pass that
 * instead). Picks from colors already used elsewhere on the site rather
 * than inventing new ones, varied per slug so a grid of monogram tiles
 * doesn't read as one flat, monotonous block.
 */
const FALLBACK_TINTS = ["#00C2CC", "#9B8FC4", "#C7A45C", "#2FA8B0", "#DA9877", "#7BE0B8", "#6BC7FF", "#FF7EB6"];

export function tintFor(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return FALLBACK_TINTS[h % FALLBACK_TINTS.length];
}
