/**
 * Dates on guides (data/guideRows.json "updated").
 *
 * Older rows store "D Mon" ("20 Oct") with no year; every one of those was
 * last passed in 2026. New rows, including everything scripts/import-articles.mjs
 * writes, store a full ISO date ("2026-11-10"). Read both through here so a
 * guide updated in 2027 isn't shown or dated as 2026.
 */
const MONTHS = "JanFebMarAprMayJunJulAugSepOctNovDec";
/** The year "D Mon" rows were written in. */
const LEGACY_YEAR = 2026;

/** ISO date (yyyy-mm-dd) for a guide's "updated" value, or null if it can't be read. */
export function guideIso(d: string): string | null {
  const v = d.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const m = /^(\d{1,2}) ([A-Z][a-z]{2})$/.exec(v);
  const mon = m ? MONTHS.indexOf(m[2]) / 3 + 1 : 0;
  return m && mon >= 1 ? `${LEGACY_YEAR}-${String(mon).padStart(2, "0")}-${m[1].padStart(2, "0")}` : null;
}

/** "20 Oct 2026" for display. */
export function guideLabel(d: string): string {
  const iso = guideIso(d);
  if (!iso) return d;
  const [y, mo, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS.slice((mo - 1) * 3, mo * 3)} ${y}`;
}
