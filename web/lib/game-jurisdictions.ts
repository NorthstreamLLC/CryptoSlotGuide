import hacksaw from "@/data/hacksaw-jurisdictions.json";
import sheetMeta from "@/data/studio-sheet-meta.json";

/**
 * Where an individual game is approved, from the studios' own game sheets.
 *
 * This is a level of detail nothing else on the site reaches. Our other
 * geography is operator-level — which casinos accept your country — but a
 * regulated market licenses the *game* too, so a casino can be live in
 * Ontario while a given slot is not. 602 titles across Hacksaw Gaming and
 * Play'n GO now carry that.
 *
 * TWO SHEETS, TWO VOCABULARIES, normalised here rather than at import so the
 * raw values stay auditable in the data files.
 *
 *  - Labels differ: Hacksaw writes "CA-Ontario", Play'n GO writes "Ontario".
 *  - Values differ, and most are not yes-or-no. Play'n GO uses Yes, No, GNC,
 *    SFA, EoS, CIP, RFA, GGL and "Yes*"; Hacksaw uses Yes, No, "-" and bare
 *    approval reference numbers. Only a plain "Yes" is read as approved.
 *    Everything else is "not stated" rather than "no", because we do not know
 *    what GNC or RFA mean and guessing would publish a refusal the studio
 *    never wrote.
 */

export type Approval = "approved" | "not-approved" | "unstated";

/** Canonical region key -> the labels the two sheets use for it. */
const REGIONS: { key: string; name: string; labels: string[] }[] = [
  { key: "CA-ON", name: "Ontario", labels: ["CA-Ontario", "Ontario"] },
  { key: "CA-QC", name: "Québec", labels: ["CA-Quebec", "Quebec"] },
  { key: "CA-AB", name: "Alberta", labels: ["CA-Alberta", "Alberta"] },
  { key: "US-MI", name: "Michigan", labels: ["Michigan"] },
  { key: "US-NJ", name: "New Jersey", labels: ["New Jersey"] },
  { key: "US-PA", name: "Pennsylvania", labels: ["Pennsylvania"] },
  { key: "US-WV", name: "West Virginia", labels: ["West Virginia"] },
  { key: "US-CT", name: "Connecticut", labels: ["Connecticut"] },
  { key: "GB", name: "United Kingdom", labels: ["UK (UKGC)", "UK"] },
  { key: "SE", name: "Sweden", labels: ["Sweden", "Sweden Romania"] },
  { key: "DE", name: "Germany", labels: ["Germany"] },
  { key: "NL", name: "Netherlands", labels: ["Netherlands"] },
  { key: "DK", name: "Denmark", labels: ["Denmark"] },
  { key: "ES", name: "Spain", labels: ["Spain"] },
  { key: "IT", name: "Italy", labels: ["Italy"] },
  { key: "BR", name: "Brazil", labels: ["Brazil"] },
  { key: "MT", name: "Malta", labels: ["Malta (MGA)"] },
  { key: "CW", name: "Curaçao", labels: ["Curacao"] },
];

export const JURISDICTION_REGIONS = REGIONS.map(({ key, name }) => ({ key, name }));

interface Raw {
  name: string;
  studio: string;
  values: Record<string, string>;
}

const RAW: Map<string, Raw> = (() => {
  const out = new Map<string, Raw>();
  const h = (hacksaw as { games: Record<string, { name: string; approvals: Record<string, string> }> }).games;
  for (const [slug, g] of Object.entries(h)) out.set(slug, { name: g.name, studio: "Hacksaw Gaming", values: g.approvals });
  const m = (sheetMeta as { games: Record<string, { name: string; studio: string; jurisdictions?: Record<string, string> }> }).games;
  for (const [slug, g] of Object.entries(m)) {
    if (!g.jurisdictions) continue;
    out.set(slug, { name: g.name, studio: g.studio, values: g.jurisdictions });
  }
  return out;
})();

export const hasJurisdictionData = (slug: string): boolean => RAW.has(slug);
export const jurisdictionCount = RAW.size;

function read(values: Record<string, string>, labels: string[]): { state: Approval; raw: string | null } {
  for (const l of labels) {
    const v = values[l];
    if (v === undefined || v === "") continue;
    if (v === "Yes") return { state: "approved", raw: v };
    if (v === "No") return { state: "not-approved", raw: v };
    // "GNC", "SFA", "RFA", "Yes*", a bare reference number, "-": the sheets
    // use these and we do not know what each means. Shown as stated, never
    // resolved into a yes or a no.
    return { state: "unstated", raw: v };
  }
  return { state: "unstated", raw: null };
}

export interface GameApproval {
  key: string;
  name: string;
  state: Approval;
  raw: string | null;
}

/** Every region the sheet says something about, for one game. */
export function approvalsFor(slug: string): { studio: string; rows: GameApproval[] } | null {
  const g = RAW.get(slug);
  if (!g) return null;
  const rows = REGIONS.map(({ key, name, labels }) => ({ key, name, ...read(g.values, labels) })).filter((r) => r.raw !== null);
  return rows.length ? { studio: g.studio, rows } : null;
}

/** How many games the sheets approve in one region — the map's figure. */
export function approvedCount(regionKey: string): { approved: number; of: number } {
  const region = REGIONS.find((r) => r.key === regionKey);
  if (!region) return { approved: 0, of: 0 };
  let approved = 0;
  let of = 0;
  for (const g of RAW.values()) {
    const { state, raw } = read(g.values, region.labels);
    if (raw === null) continue;
    of++;
    if (state === "approved") approved++;
  }
  return { approved, of };
}
