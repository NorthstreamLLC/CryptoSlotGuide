/**
 * The Curaçao Gaming Authority's online gaming licence register, as counted
 * for /legal/curacao-licence-tracker. Per-casino rows are the "Compliance /
 * Register check" facts in data/casinoSpecSheets.json; this file holds only
 * the register-wide counts, re-counted from the PDF at each monthly re-check.
 *
 * How the counts are made: pdftotext -layout on the PDF; a row starts at a
 * line holding a licence number, (OGL|CGA)/20xx/n/n, and runs to the next
 * one, because a long status wraps onto the following line. The status is
 * read case-insensitively from the whole row (the register spells it both
 * "Assessment in progress" and "Assessment In progress"; missing the second
 * undercounted by two in early November 2026):
 *  - "Expired" includes a row that reads "Expired" with "administrative
 *    appeal" wrapped onto the next line (Bull Gaming N.V.);
 *  - "Revoked" covers every revocation wording, which from November reads
 *    "revoked on <date>, at the request of the operator/licensee", and one
 *    row the register misspells "Reoked";
 *  - a row with dates and no status is "Newer licences with an expiry date".
 *
 * Counts are by row. From 11 November one licence number, OGL/2024/599/0274
 * (Boom Line B.V.), appears on two rows with different statuses ("Assessment
 * in progress" and a revocation); it is counted under each, so the rows
 * (total) are one more than the licence numbers (unique). We don't pick one.
 */
export type RegisterCount = { key: string; label: string; n: number; tone: "watch" | "ok" | "bad" | "plain" };

export const CGA_REGISTER = {
  date: "2026-11-12",
  url: "https://gamingcontrol.spin-cdn.com/media/license_registry/20261112_20261112_ogl_registry.pdf",
  registerPage: "https://www.cga.cw/en/133i348441001",
  /** Rows on the register. */
  total: 669,
  /** Distinct licence numbers: one is listed twice (see above). */
  unique: 668,
  counts: [
    { key: "assess", label: "Assessment in progress", n: 294, tone: "watch" },
    { key: "indef", label: "Indefinite (no expiry date)", n: 203, tone: "ok" },
    { key: "dated", label: "Newer licences with an expiry date", n: 50, tone: "plain" },
    { key: "expired", label: "Expired", n: 56, tone: "bad" },
    { key: "revoked", label: "Revoked", n: 62, tone: "bad" },
    { key: "reeval", label: "Assessment in re-evaluation", n: 4, tone: "watch" },
  ] as RegisterCount[],
  /** Earlier registers we re-counted, oldest first, for the "assessment in progress" trend. */
  history: [
    { date: "2026-10-20", assess: 299, total: 666 },
    { date: "2026-10-30", assess: 298, total: 666 },
    { date: "2026-11-12", assess: 294, total: 669 },
  ],
};
