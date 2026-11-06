/**
 * The Curaçao Gaming Authority's online gaming licence register, as counted
 * for /legal/curacao-licence-tracker. Per-casino rows are the "Compliance /
 * Register check" facts in data/casinoSpecSheets.json; this file holds only
 * the register-wide counts, re-counted from the PDF at each monthly re-check.
 *
 * How the counts are made: pdftotext -layout on the PDF, one row per line
 * matching (OGL|CGA)/20xx/n/n, the status read case-insensitively (the
 * register spells it both "Assessment in progress" and "Assessment In
 * progress"; missing the second undercounted by two in early November 2026).
 */
export type RegisterCount = { key: string; label: string; n: number; tone: "watch" | "ok" | "bad" | "plain" };

export const CGA_REGISTER = {
  date: "2026-10-30",
  url: "https://gamingcontrol.spin-cdn.com/media/license_registry/20261030_20261030_ogl_registry.pdf",
  registerPage: "https://www.cga.cw/en/133i348441001",
  total: 666,
  counts: [
    { key: "assess", label: "Assessment in progress", n: 298, tone: "watch" },
    { key: "indef", label: "Indefinite (no expiry date)", n: 209, tone: "ok" },
    { key: "dated", label: "Newer licences with an expiry date", n: 51, tone: "plain" },
    { key: "expired", label: "Expired", n: 54, tone: "bad" },
    { key: "revoked", label: "Revoked", n: 50, tone: "bad" },
    { key: "reeval", label: "Assessment in re-evaluation", n: 4, tone: "watch" },
  ] as RegisterCount[],
  /** Earlier registers, oldest first, for the "assessment in progress" trend. */
  history: [
    { date: "2026-10-20", assess: 299, total: 666 },
    { date: "2026-10-30", assess: 298, total: 666 },
  ],
};
