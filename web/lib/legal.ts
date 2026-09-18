import restricted from "@/data/restricted.json";
import geoEurope from "@/data/geo-europe.json";
import legalUS from "@/data/legal-us.json";
import legalWorld from "@/data/legal-world.json";
import geoWorld from "@/data/geo-world.json";
import geoUS from "@/data/geo-us.json";
import { siteData } from "@/lib/site-data";
import { getSpecFact } from "@/lib/spec-sheet";
import { SWEEPS, sweepsFact } from "@/lib/sweeps";

/**
 * Online gambling law by US state and by country, each status backed by the
 * regulator's or government's own page (see `sources`). Map shapes are
 * precomputed SVG paths (world-atlas 110m, Natural Earth projection; us-atlas
 * Albers), so the map ships as plain markup with no mapping library.
 */
export interface Source {
  label: string;
  url: string;
}

export interface USState {
  code: string;
  name: string;
  onlineCasino: string;
  sportsBetting: string;
  sweepstakes: string;
  /** Whether a sweepstakes ban comes from a law or regulator action, with the bill or chapter and date. */
  sweepstakesDetail?: string;
  pokerOnline?: string;
  minAge?: string;
  regulator?: { name: string; url: string };
  licensedOnlineCasinos?: string[];
  licensedListUrl?: string;
  note?: string;
  sources: Source[];
}

export interface Country {
  code: string;
  name: string;
  onlineCasino: string;
  sportsBetting: string;
  regulator?: { name: string; url: string } | null;
  minAge?: string;
  crypto?: string;
  licensing?: string;
  note?: string;
  sources: Source[];
}

export interface Shape {
  code: string | null;
  name: string;
  d: string;
  c?: number[];
}

export const US_STATES = legalUS as USState[];
export const COUNTRIES = legalWorld as Country[];
export const WORLD_SHAPES = geoWorld as Shape[];
export const US_SHAPES = geoUS as Shape[];

export const stateBy = (code: string) => US_STATES.find((s) => s.code.toLowerCase() === code.toLowerCase()) ?? null;
export const countryBy = (code: string) => COUNTRIES.find((c) => c.code.toLowerCase() === code.toLowerCase()) ?? null;

export type Tone = "legal" | "partial" | "grey" | "banned" | "none";

/** Colour band for an online-casino status string. */
export function toneOf(status?: string): Tone {
  const s = (status ?? "").toLowerCase();
  if (!s) return "none";
  if (/not legal|banned|prohibited|illegal/.test(s)) return "banned";
  if (/monopoly|retail only|state-run|varies/.test(s)) return "partial";
  if (/no specific|grey|gray|unregulated|no licensing yet/.test(s)) return "grey";
  if (/legal|licensed|allowed|online|regulated/.test(s)) return "legal";
  return "none";
}

export const TONE: Record<Tone, { fill: string; label: string }> = {
  legal: { fill: "#2FB67A", label: "Legal & licensed" },
  partial: { fill: "#2FA8B0", label: "State monopoly / varies by state" },
  grey: { fill: "#C7A45C", label: "No specific law" },
  banned: { fill: "#C4653A", label: "Not legal" },
  none: { fill: "#2A3439", label: "Not yet covered" },
};

/** Casinos on the site whose own restricted-country list names this country. */
export function casinosRestricting(countryName: string, aliases: string[] = []): { slug: string; name: string; url?: string }[] {
  const names = [countryName, ...aliases].map((n) => n.toLowerCase());
  return siteData.ops
    .map((o) => ({ o, f: getSpecFact(o.slug, "Compliance", "Restricted countries") }))
    .filter(({ f }) => {
      const text = (f?.value ?? f?.chips?.join(", ") ?? "").toLowerCase();
      return text && names.some((n) => new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text));
    })
    .map(({ o, f }) => ({ slug: o.slug, name: o.name, url: f?.sourceUrl }));
}

/** Sweepstakes casinos whose own restricted-state list does not name this state. */
export function sweepsAvailableIn(stateName: string, code: string) {
  return SWEEPS.filter((s) => s.facts.length).map((s) => {
    const f = sweepsFact(s, "Restricted states");
    const text = f?.value ?? "";
    const excluded = !!text && (new RegExp(`(?<!West )\\b${stateName}\\b`, "i").test(text) || new RegExp(`\\b${code}\\b`).test(text));
    return { s, excluded, known: !!f };
  });
}

export const COUNTRY_ALIASES: Record<string, string[]> = {
  US: ["united states", "usa", "us", "u.s."],
  GB: ["united kingdom", "uk", "great britain"],
  NL: ["netherlands", "the netherlands"],
  KR: ["south korea", "korea"],
  CW: ["curaçao", "curacao"],
  AE: ["united arab emirates", "uae"],
};


export const EUROPE_SHAPES = geoEurope as Shape[];

interface Restricted {
  slug: string;
  codes: string[];
  regions: string[];
  complete: boolean;
  url: string;
  note?: string;
}
const RESTRICTED = restricted as Restricted[];
export const restrictedFor = (slug: string) => RESTRICTED.find((r) => r.slug === slug) ?? null;

export type Access = "accepts" | "restricted" | "partial";

/**
 * Whether a casino takes players from a country, from its own restricted-countries list:
 * "restricted" if the list names the country, "accepts" if a complete list doesn't,
 * "partial" if the list doesn't name it but the casino says it may restrict others too.
 */
export function accessIn(slug: string, code: string): Access | null {
  const r = restrictedFor(slug);
  if (!r || (!r.codes.length && !r.complete)) return null;
  if (r.codes.includes(code.toUpperCase())) return "restricted";
  return r.complete ? "accepts" : "partial";
}

export function casinosByAccess(code: string) {
  const out: Record<Access, { slug: string; name: string; mono: string }[]> = { accepts: [], restricted: [], partial: [] };
  for (const o of siteData.ops) {
    const a = accessIn(o.slug, code);
    if (a) out[a].push({ slug: o.slug, name: o.name, mono: o.mono });
  }
  return out;
}
