import { COUNTRIES, TONE, toneOf, casinosByAccess } from "@/lib/legal";
import { logoFor } from "@/lib/logo";
import type { HoverInfo } from "@/components/legal/MapHover";

const row = (label: string, v?: string) => ({ label, value: v ?? "Not covered", color: TONE[toneOf(v)].fill });

/** Hover card per country: legal status plus the crypto casinos whose own lists accept players from there. */
export function countryHoverInfo(codes: (string | null)[]): Record<string, HoverInfo> {
  const info: Record<string, HoverInfo> = {};
  for (const code of new Set(codes.filter(Boolean) as string[])) {
    const c = COUNTRIES.find((x) => x.code === code);
    const acc = casinosByAccess(code).accepts;
    const rows =
      code === "US"
        ? [{ label: "Online casinos", value: "varies by state", color: TONE.partial.fill }, { label: "Sports betting", value: "varies by state", color: TONE.partial.fill }]
        : c
          ? [row("Online casinos", c.onlineCasino), row("Sports betting", c.sportsBetting), ...(c.minAge ? [{ label: "Minimum age", value: c.minAge, color: "#6E7F88" }] : [])]
          : [];
    if (!rows.length && !acc.length) continue;
    info[code] = {
      name: c?.name ?? (code === "US" ? "United States" : code),
      rows,
      casinosTitle: `Crypto casinos that accept players (${acc.length})`,
      casinos: acc.map((o) => ({ name: o.name, logo: logoFor(o.slug) })),
      casinosNote: "None of our listed casinos accept players from here",
    };
  }
  return info;
}
