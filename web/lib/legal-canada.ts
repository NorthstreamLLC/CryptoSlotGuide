import data from "@/data/legal-canada.json";
import shapes from "@/data/geo-canada.json";
import restricted from "@/data/restricted.json";
import { siteData } from "./site-data";
import type { Shape } from "./legal";

/**
 * Canada, province by province.
 *
 * Canada needs its own map because it is not one jurisdiction. The Criminal
 * Code lets each province conduct and manage gambling in its own territory,
 * so "is this legal in Canada" has thirteen answers — and the operators know
 * it: seven of the casinos we track name Ontario in their own terms as a
 * place they will not serve, which the world map cannot show.
 *
 * Two independent layers, deliberately kept apart:
 *
 *  - WHAT THE LAW SAYS, from data/legal-canada.json. Provinces we have not
 *    yet sourced carry nulls and say so on the page rather than inheriting a
 *    neighbour's answer.
 *  - WHO WILL TAKE YOU, from each operator's own terms via restricted.json.
 *    This is fully sourced for every operator and is the part a reader
 *    actually acts on.
 */

export interface CaProvince {
  code: string;
  name: string;
  model: string;
  summary: string | null;
  regulator: { name: string; url: string | null } | null;
  provincialOperator: { name: string; url: string | null } | null;
  sourced: boolean;
}

interface CaData {
  federal: { summary: string; sources: { label: string; url: string }[] };
  provinces: CaProvince[];
}

const DB = data as CaData;
export const CA_FEDERAL = DB.federal;
export const CA_PROVINCES = DB.provinces;
export const CA_SHAPES = shapes as Shape[];
export const CA_VIEWBOX = "0 0 960 760";

const BY_CODE = new Map(CA_PROVINCES.map((p) => [p.code, p]));
export const caProvince = (code: string): CaProvince | undefined => BY_CODE.get(code.toUpperCase());

interface RestrictedRow {
  slug: string;
  regions?: string[] | null;
  url?: string | null;
}
const RESTRICTED = restricted as RestrictedRow[];

/**
 * Province names as they appear in operators' own restricted lists, e.g.
 * "Ontario (Canada)". Matched on the province name rather than a code
 * because that is what the terms are written in.
 */
function provinceInRegion(region: string, p: CaProvince): boolean {
  const r = region.toLowerCase();
  if (!r.includes("canada")) return false;
  const name = p.name.toLowerCase();
  // Québec is written both ways in operator terms.
  const alts = p.code === "QC" ? [name, "quebec"] : [name];
  return alts.some((a) => r.includes(a));
}

export interface BlockedOperator {
  slug: string;
  name: string;
  sourceUrl: string | null;
}

/** Operators whose own terms name this province as one they will not serve. */
export function operatorsBlocking(code: string): BlockedOperator[] {
  const p = caProvince(code);
  if (!p) return [];
  const names = new Map(siteData.ops.map((o) => [o.slug, o.name]));
  return RESTRICTED.filter((r) => (r.regions ?? []).some((x) => provinceInRegion(x, p)))
    .map((r) => ({ slug: r.slug, name: names.get(r.slug) ?? r.slug, sourceUrl: r.url ?? null }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Provinces named by at least one operator, worst first — the map's point. */
export function blockedCounts(): { code: string; name: string; n: number }[] {
  return CA_PROVINCES.map((p) => ({ code: p.code, name: p.name, n: operatorsBlocking(p.code).length })).sort(
    (a, b) => b.n - a.n || a.name.localeCompare(b.name)
  );
}

/** What the map colours by: the legal model, not the operator count. */
export function modelOf(code: string): string | undefined {
  return caProvince(code)?.model;
}
