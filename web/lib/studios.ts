import data from "@/data/provider-licences.json";

/**
 * Where each game studio holds a licence or approval, taken from the studio's
 * own site (licence page, footer or its own licence announcements). Codes are
 * ISO country codes, plus "CA-ON"-style provinces and "US-NJ"-style states.
 */
export interface StudioLicence {
  code: string;
  name: string;
  regulator: string;
  url: string;
  note?: string;
}

export interface Studio {
  slug: string;
  name: string;
  parent: string | null;
  founded: number | string | null;
  sourceUrl: string;
  licences: StudioLicence[];
}

export const STUDIOS = (data as Studio[]).sort((a, b) => b.licences.length - a.licences.length || a.name.localeCompare(b.name));

/** The country a licence code sits in: "US-NJ" → "US". */
export const countryOf = (code: string) => code.split("-")[0];

/** Studios licensed in a country, with any state or province detail, e.g. Evolution → ["NJ", "PA", ...] for "US". */
export function studiosIn(country: string) {
  return STUDIOS.map((s) => {
    const hits = s.licences.filter((l) => countryOf(l.code) === country);
    return { s, subs: hits.filter((l) => l.code.includes("-")).map((l) => l.code.split("-")[1]), licensed: hits.length > 0 };
  }).filter((x) => x.licensed);
}

export const studioBy = (slug: string) => STUDIOS.find((s) => s.slug === slug) ?? null;
