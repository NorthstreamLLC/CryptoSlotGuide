/**
 * Dates on guides (data/guideRows.json "updated"): stored as full ISO dates
 * ("2026-11-10"), with display strings derived here, so no year is assumed.
 * scripts/import-articles.mjs writes the same format.
 */
const MONTHS = "JanFebMarAprMayJunJulAugSepOctNovDec";

/** The ISO date, or null if the value isn't one (a row in an old format fails loudly in tests). */
export function guideIso(d: string): string | null {
  const v = d.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const t = Date.parse(`${v}T00:00:00Z`);
  return Number.isNaN(t) || new Date(t).toISOString().slice(0, 10) !== v ? null : v;
}

function parts(d: string) {
  const iso = guideIso(d);
  if (!iso) return null;
  const [y, m, day] = iso.split("-").map(Number);
  return { y, mon: MONTHS.slice((m - 1) * 3, m * 3), day };
}

/** "20 Oct", the short form the guide lists have always shown. */
export function guideShort(d: string): string {
  const p = parts(d);
  return p ? `${p.day} ${p.mon}` : d;
}

/** "20 Oct 2026". */
export function guideLabel(d: string): string {
  const p = parts(d);
  return p ? `${p.day} ${p.mon} ${p.y}` : d;
}
