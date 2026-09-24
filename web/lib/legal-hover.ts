import { COUNTRIES, TONE, toneOf, casinosByAccess } from "@/lib/legal";
import { logoFor } from "@/lib/logo";
import type { HoverInfo } from "@/components/legal/MapHover";

const row = (label: string, v?: string) => ({ label, value: v ?? "Not covered", color: TONE[toneOf(v)].fill });

/** Hover card per country: legal status plus the crypto casinos whose own lists accept players from there. */
export function countryHoverInfo(shapes: ({ code: string | null; name?: string } | string | null)[]): Record<string, HoverInfo> {
  const info: Record<string, HoverInfo> = {};
  // The map knows every country's name, including the ones we have no legal
  // page for; without it those cards would be titled "NG".
  const names = new Map<string, string>();
  for (const s of shapes) if (s && typeof s === "object" && s.code && s.name) names.set(s.code, s.name);
  const codes = shapes.map((s) => (typeof s === "string" ? s : s?.code ?? null));
  for (const code of new Set(codes.filter(Boolean) as string[])) {
    const c = COUNTRIES.find((x) => x.code === code);
    const acc = casinosByAccess(code).accepts;
    const rows =
      code === "US"
        ? [{ label: "Online casinos", value: "varies by state", color: TONE.partial.fill }, { label: "Sports betting", value: "varies by state", color: TONE.partial.fill }]
        : c
          ? [row("Online casinos", c.onlineCasino), row("Sports betting", c.sportsBetting), ...(c.minAge ? [{ label: "Minimum age", value: c.minAge, color: "#8E9CA5" }] : [])]
          : // Grey on the map means we have not published this country's law yet —
            // not that anything is restricted. Without saying so, the card shows a
            // long list of casinos under no heading and the colour reads as a ban.
            [{ label: "Gambling law", value: "not covered yet", color: TONE.none.fill }];
    if (!rows.length && !acc.length) continue;
    info[code] = {
      name: c?.name ?? (code === "US" ? "United States" : names.get(code) ?? code),
      rows,
      casinosTitle: `Casinos accepting players here, per their own terms (${acc.length})`,
      casinos: acc.map((o) => ({ name: o.except.length ? `${o.name} (not ${o.except.join(", ")})` : o.name, logo: logoFor(o.slug) })),
      casinosNote: "None of our listed casinos accept players from here",
    };
  }
  return info;
}
