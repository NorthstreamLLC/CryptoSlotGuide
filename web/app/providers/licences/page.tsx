import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { WORLD_SHAPES, EUROPE_SHAPES, US_SHAPES } from "@/lib/legal";
import { STUDIOS, studiosIn, studioBy, countryOf } from "@/lib/studios";
import { LegalMap } from "@/components/legal/LegalMap";
import { MapHover, type HoverInfo } from "@/components/legal/MapHover";
import { LegalHero } from "@/components/legal/LegalUI";
import { logoFor } from "@/lib/logo";
import { NextSteps } from "@/components/layout/NextSteps";

export const metadata = pageMetadata(
  "Where game studios are licensed: world map",
  "Pick a slot or live-casino studio to see every country, US state and Canadian province where it holds a licence, or hover a country to see which studios are licensed there. Taken from each studio's own licence pages.",
  "/providers/licences"
);

const MONO = "var(--font-jetbrains-mono), monospace";
const SHADES = [
  { min: 15, color: "#2FB67A", label: "15+ studios" },
  { min: 8, color: "#57C98F", label: "8–14" },
  { min: 3, color: "#8FD9A8", label: "3–7" },
  { min: 1, color: "#C7A45C", label: "1–2" },
];

export default async function Page({ searchParams }: { searchParams: Promise<{ studio?: string; view?: string }> }) {
  const { studio: sk, view } = await searchParams;
  const studio = sk ? studioBy(sk) : null;
  const europe = view === "europe";
  const us = view === "us";
  const shapes = us ? US_SHAPES : europe ? EUROPE_SHAPES : WORLD_SHAPES;
  /** In the US view a region is a state: match "US-NJ"-style codes; otherwise match by country. */
  const regionOf = (code: string) => (us ? (code.startsWith("US-") ? code.slice(3) : null) : countryOf(code));
  const studiosInRegion = (region: string) =>
    us
      ? STUDIOS.filter((st) => st.licences.some((l) => l.code === `US-${region}`)).map((st) => ({ s: st, subs: [] as string[], licensed: true }))
      : studiosIn(region);
  const licensedHere = new Set(studio?.licences.map((l) => regionOf(l.code)).filter(Boolean) as string[]);

  const info: Record<string, HoverInfo> = {};
  for (const sh of shapes) {
    if (!sh.code || info[sh.code]) continue;
    const list = studiosInRegion(sh.code);
    if (!list.length) continue;
    const mine = studio ? studio.licences.filter((l) => regionOf(l.code) === sh.code) : [];
    info[sh.code] = {
      name: sh.name,
      rows: studio
        ? [{ label: studio.name, value: mine.length ? "Licensed" : "Not licensed", color: mine.length ? "#2FB67A" : "#C4653A" }, ...mine.map((l) => ({ label: l.code.includes("-") ? l.code.split("-")[1] : "Regulator", value: l.regulator, color: "#8E9CA5" }))]
        : [{ label: "Studios licensed", value: String(list.length), color: "#2FB67A" }],
      casinosTitle: `Studios licensed here (${list.length})`,
      noLink: true,
      casinos: list.map((x) => ({ name: x.subs.length ? `${x.s.name} (${x.subs.join(", ")})` : x.s.name, logo: logoFor(x.s.slug) })),
    };
  }

  const fill = (code: string) => {
    if (studio) return licensedHere.has(code) ? "#2FB67A" : "#1C2328";
    const n = studiosInRegion(code).length;
    return n ? SHADES.find((s) => n >= s.min)?.color : "#1C2328";
  };
  const q = (o: { studio?: string | null; view?: string | null }) => {
    const p = new URLSearchParams();
    const st = o.studio === undefined ? studio?.slug : o.studio;
    const vw = o.view === undefined ? (europe ? "europe" : us ? "us" : null) : o.view;
    if (st) p.set("studio", st);
    if (vw) p.set("view", vw);
    const s = p.toString();
    return `/providers/licences${s ? `?${s}` : ""}`;
  };

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Game providers", path: "/providers" }, { name: "Licence map", path: "/providers/licences" }])} />
      <LegalHero crumbs={[{ label: "Home", href: "/" }, { label: "Game providers", href: "/providers" }, { label: "Licence map" }]} eyebrow="Game studios" title={studio ? `Where ${studio.name} is licensed` : "Where game studios are licensed"}>
        <p style={{ margin: 0, maxWidth: "64ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE" }}>
          {studio
            ? `${studio.name} lists ${studio.licences.length} licences and approvals on its own site${studio.parent ? `; it is part of ${studio.parent}` : ""}. Hover a market for the regulator, or open its profile.`
            : `${STUDIOS.length} slot and live-casino studios and every licence they list on their own sites. Pick a studio to light up its markets, or hover a country to see who is licensed there.`}
        </p>
      </LegalHero>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 24px 80px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {[["World", null], ["Europe", "europe"], ["US states", "us"]].map(([label, v]) => {
            const on = (v ?? null) === (europe ? "europe" : us ? "us" : null);
            return (
              <Link key={label} href={q({ view: v })} scroll={false} style={{ padding: "8px 16px", borderRadius: 100, border: `1px solid ${on ? "rgba(47,182,122,.55)" : "rgba(255,255,255,.12)"}`, background: on ? "rgba(47,182,122,.14)" : "transparent", fontSize: 13.5, fontWeight: 700, color: on ? "#7BE0B8" : "#A8B6BE" }}>
                {label}
              </Link>
            );
          })}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          <Link href={q({ studio: null })} scroll={false} style={chip(!studio)}>All studios</Link>
          {STUDIOS.map((s) => (
            <Link key={s.slug} href={q({ studio: s.slug })} scroll={false} style={chip(studio?.slug === s.slug)}>
              {s.name} <span style={{ opacity: 0.55 }}>{s.licences.length}</span>
            </Link>
          ))}
        </div>

        <div style={{ padding: 18, borderRadius: 20, background: "#0B0F12", border: "1px solid rgba(255,255,255,.07)" }}>
          <MapHover info={info}>
            <LegalMap
              shapes={shapes}
              viewBox={us ? "0 0 975 610" : europe ? "0 0 960 680" : "0 0 960 470"}
              labels={us}
              statusOf={() => undefined}
              hrefOf={() => null}
              fillOf={fill}
              legend={studio ? [{ color: "#2FB67A", label: `${studio.name} licensed` }, { color: "#1C2328", label: "Not licensed" }] : SHADES.map((s) => ({ color: s.color, label: s.label }))}
            />
          </MapHover>
        </div>

        {studio && (
          <Link href={`/providers/${studio.slug}`} style={{ display: "inline-block", marginTop: 16, fontSize: 14, fontWeight: 700, color: "#00C2CC" }}>Open the {studio.name} profile →</Link>
        )}
        {studio && (
          <div style={{ marginTop: 22, padding: "8px 24px", borderRadius: 18, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
            {studio.licences.map((l, i) => (
              <div key={l.code + i} style={{ display: "grid", gridTemplateColumns: "minmax(110px, 180px) 1fr", gap: 14, padding: "12px 0", borderTop: i ? "1px solid rgba(255,255,255,.06)" : undefined }}>
                <div style={{ fontFamily: MONO, fontSize: 11, color: "#A8B6BE" }}>{l.name}</div>
                <div style={{ fontSize: 13.5, color: "#C6D1D7" }}>
                  {l.regulator} <a href={l.url} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>source ↗</a>
                  {l.note && <div style={{ fontSize: 12, color: "#8E9CA5", marginTop: 2 }}>{l.note}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        <p style={{ margin: "22px 0 0", maxWidth: "80ch", fontSize: 12.5, lineHeight: 1.6, color: "#8E9CA5" }}>
          Licences as each studio lists them on its own site. Studios often hold more than they publish (NetEnt, Red Tiger and Big Time Gaming point to their parent Evolution&apos;s list), so a blank country doesn&apos;t always mean no licence.
        </p>
        <NextSteps
          steps={[
            { href: "/providers", label: "Studio profiles", hint: "Profiled on RTP disclosure rather than catalogue size." },
            { href: "/slots", label: "Slot RTP index", hint: "Every title we track and its published return." },
            { href: "/legal", label: "Gambling laws", hint: "The regulators behind these licences, country by country." },
          ]}
        />
      </section>
    </main>
  );
}

function chip(on: boolean) {
  return { padding: "6px 11px", borderRadius: 100, border: `1px solid ${on ? "rgba(0,194,204,.5)" : "rgba(255,255,255,.1)"}`, background: on ? "rgba(0,194,204,.12)" : "rgba(255,255,255,.02)", fontSize: 12.5, fontWeight: 600, color: on ? "#5FE3E8" : "#A8B6BE" } as const;
}
