/**
 * Match a studio sheet's title to a catalogue game, by name, within a studio.
 *
 * Every importer used to recompute a slug from the sheet's name and look that
 * slug up in the catalogue. That failed on 190 titles across three studios,
 * and a diagnosis of all 190 found the great majority were the SAME name
 * spelt by two systems: Hacksaw's sheet carries HTML entities ("Hold &amp;
 * Win"), Pragmatic's export is cp1252 and uses typographic apostrophes and
 * en-dashes ("Joker’s Jewels", "Big Bass – Hold & Spinner"), the catalogue
 * sometimes closes spaces ("2Wild2Die", "Fred's Foodtruck"), and the
 * catalogue's own slugs are not slugify(name) anyway ("franks-farm" vs
 * "frank-s-farm"). None of that is a different game.
 *
 * So titles are matched on a key that keeps only letters and digits, after
 * decoding entities, stripping ™/® and folding accents — scoped to the same
 * studio, because ten catalogue names are shared between studios and a key
 * match across studios would hand one studio's title another's figures.
 *
 * Exact key equality only. No similarity threshold: "Midnight Princess
 * Origins" scores 0.81 against "Moon Princess Origins" and is not the same
 * title, and a build variant ("Marlin Masters OG", "Big Bass Dice",
 * "...High Limit") must never overwrite its base title's returns. What does
 * not match exactly stays unmatched and is reported, which is the honest
 * outcome.
 */

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function titleKey(raw) {
  if (raw == null) return "";
  let s = String(raw);
  // Entities, including the double-escaped "&amp;amp;" a sheet can carry.
  for (let i = 0; i < 2; i++) {
    s = s.replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, n) => ENTITIES[n]).replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
  }
  s = s.normalize("NFKD").replace(/[̀-ͯ]/g, ""); // fold accents
  s = s.replace(/[™®©]/g, "");
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export const studioKey = (s) => titleKey(s);

/**
 * Build the index once from the catalogue; `match(name, studio)` then returns
 * the catalogue game or null. A key that two games of one studio share is
 * ambiguous and matches neither — the catalogue holds a few such pairs
 * (regional re-releases under one name), and guessing between them is worse
 * than skipping both.
 */
export function titleMatcher(games) {
  const index = new Map();
  const ambiguous = new Set();
  for (const g of games) {
    if (!g.slug || !g.name) continue;
    const k = `${studioKey(g.provider)}|${titleKey(g.name)}`;
    if (index.has(k) && index.get(k).slug !== g.slug) ambiguous.add(k);
    else index.set(k, g);
  }
  for (const k of ambiguous) index.delete(k);
  return {
    match(name, studio) {
      return index.get(`${studioKey(studio)}|${titleKey(name)}`) ?? null;
    },
    ambiguous: ambiguous.size,
  };
}
