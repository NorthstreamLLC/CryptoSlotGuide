import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { FeaturedPartner } from "@/components/ui/FeaturedPartner";
import { ReportIssue } from "@/components/ui/ReportIssue";
import { NextSteps } from "@/components/layout/NextSteps";
import { tintFor } from "@/lib/logo";
import { studioAllTitles, studioStats } from "@/lib/slot-page";
import { slotEssentialsStudio } from "@/lib/slotessentials";
import type { CatalogueStudio } from "@/lib/studio-pages";

/**
 * The profile of a studio we have not written up: what our slot catalogue
 * holds for it, in full, and where to go for more.
 *
 * Deliberately says nothing about the studio itself — licences, ownership,
 * RTP disclosure policy — because none of that is sourced for these studios.
 * The written-up profiles (providers.json) carry those facts with citations;
 * this page carries the catalogue's figures, labelled as such, every title
 * linked, and the studio's SlotEssentials profile where it has one.
 */
const MONO = "var(--font-jetbrains-mono), monospace";

function Stat({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, padding: "16px 18px", borderRadius: 13, background: "#0E1316", border: "1px solid rgba(255,255,255,.07)", minWidth: 0 }}>
      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#8E9CA5" }}>{k}</span>
      <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.02em", color: "#fff", fontVariantNumeric: "tabular-nums" }}>{v}</span>
      {sub && <span style={{ fontSize: 12, color: "#83919A", overflowWrap: "anywhere" }}>{sub}</span>}
    </div>
  );
}

export function CatalogueStudioPage({ studio }: { studio: CatalogueStudio }) {
  const st = studioStats(studio.name);
  const { rows } = studioAllTitles(studio.name);
  const se = slotEssentialsStudio(studio.name);
  const db = `/slots/database?studio=${encodeURIComponent(studio.name)}`;
  const mono = studio.name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <main style={{ background: "#07090B", color: "#E8EDF0" }}>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(80% 120% at 85% 0%, rgba(0,194,204,.09), transparent 55%), #0A0D10" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 36px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 20 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/providers" style={{ color: "#83919A" }}>Game providers</Link> /{" "}
            <span style={{ color: "#A8B6BE" }}>{studio.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ width: 56, height: 56, flex: "none", borderRadius: 14, overflow: "hidden" }}>
              <BrandMark slug={studio.slug} mono={mono || studio.name.slice(0, 2).toUpperCase()} tint={tintFor(studio.slug)} radius={14} fontSize={16} />
            </span>
            <div style={{ flex: "1 1 320px", minWidth: 0 }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 6 }}>Studio profile</div>
              <h1 style={{ margin: 0, fontSize: "clamp(32px, 4vw, 46px)", lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 800, color: "#fff", textWrap: "balance" }}>
                {studio.name} slots: RTP, volatility and max win
              </h1>
              <p style={{ margin: "10px 0 0", maxWidth: "66ch", fontSize: 16, lineHeight: 1.6, color: "#A8B6BE", textWrap: "pretty" }}>
                Every {studio.name} title in our slot database — {st.titles.toLocaleString("en-GB")} {st.titles === 1 ? "slot" : "slots"} — with the return, volatility and
                max win the catalogue holds for each{se ? ", and a link to the studio's full profile on SlotEssentials, our sister site" : ""}.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
            {se && (
              <a href={se} target="_blank" rel="noopener" style={{ padding: "12px 18px", borderRadius: 10, background: "#00C2CC", color: "#04191B", fontSize: 14, fontWeight: 800 }}>
                {studio.name} on SlotEssentials ↗
              </a>
            )}
            <Link href={db} style={{ padding: "12px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,.16)", color: "#E8EDF0", fontSize: 14, fontWeight: 700 }}>
              Filter the database to {studio.name} →
            </Link>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "30px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
          <Stat k="Slots in our database" v={st.titles.toLocaleString("en-GB")} sub={st.demos ? `${st.demos} with the studio's own demo` : undefined} />
          <Stat k="Median RTP" v={st.medianRtp != null ? `${st.medianRtp}%` : "—"} sub={`${st.withRtp} of ${st.titles} carry a return`} />
          <Stat k="Highest RTP" v={st.topRtp ? `${st.topRtp.rtp}%` : "—"} sub={st.topRtp?.name} />
          <Stat k="Biggest max win" v={st.topMaxWin ? `${st.topMaxWin.x.toLocaleString("en-GB")}×` : "—"} sub={st.topMaxWin?.name} />
          {st.multiVersion > 0 && <Stat k="More than one RTP build" v={String(st.multiVersion)} sub="titles licensed at several returns" />}
          {st.firstRelease && st.lastRelease && st.firstRelease !== st.lastRelease && <Stat k="Releases on file" v={`${st.firstRelease.slice(0, 4)}–${st.lastRelease.slice(0, 4)}`} />}
        </div>
        {st.volatility.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14, alignItems: "center" }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".07em", textTransform: "uppercase", color: "#8E9CA5", marginRight: 4 }}>Volatility</span>
            {st.volatility.map((v) => (
              <span key={v.label} style={{ padding: "5px 11px", borderRadius: 100, border: "1px solid rgba(255,255,255,.1)", fontSize: 12.5, color: "#C6D1D7" }}>
                {v.label[0].toUpperCase() + v.label.slice(1)} <span style={{ fontFamily: MONO, color: "#83919A" }}>{v.n}</span>
              </span>
            ))}
          </div>
        )}
        <p style={{ margin: "14px 0 0", maxWidth: "84ch", fontSize: 12.5, lineHeight: 1.6, color: "#77858E" }}>
          Figures are the catalogue&rsquo;s, and the studio&rsquo;s own where we hold its game data. A studio that licenses lower-RTP builds does not always say so, so
          check the paytable inside the game before you judge it by the return shown here.
        </p>
      </section>

      <section id="titles" style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 24px 0", scrollMarginTop: 110 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, letterSpacing: "-.025em", color: "#fff" }}>
          All {rows.length.toLocaleString("en-GB")} {studio.name} titles we hold
        </h2>
        <p style={{ margin: "0 0 16px", maxWidth: "80ch", fontSize: 14, lineHeight: 1.6, color: "#8DA0AA" }}>
          Titles with a page here link to it; the rest link to SlotEssentials, which has a page for nearly every one.
        </p>
        <div style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 13, overflowX: "auto", background: "#0C1013" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(260px,1.6fr) 150px 130px 120px", minWidth: 680, background: "#101519", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
            {["Slot", "RTP", "Volatility", "Max win"].map((h) => (
              <div key={h} style={{ padding: "12px 18px", fontFamily: MONO, fontSize: 10.5, letterSpacing: ".07em", textTransform: "uppercase", color: "#83919A" }}>{h}</div>
            ))}
          </div>
          {rows.map((r, i) => (
            <div key={`${r.slug ?? r.name}-${i}`} style={{ display: "grid", gridTemplateColumns: "minmax(260px,1.6fr) 150px 130px 120px", minWidth: 680, borderBottom: "1px solid rgba(255,255,255,.05)" }}>
              <div style={{ padding: "11px 18px", minWidth: 0, display: "flex", alignItems: "center", gap: 12 }}>
                {r.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image} alt="" width={52} height={31} loading="lazy" style={{ width: 52, height: 31, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(255,255,255,.08)", flex: "0 0 auto" }} />
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#E8EDF0", display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    {r.href ? (
                      /^https?:\/\//.test(r.href) ? (
                        <a href={r.href} target="_blank" rel="noopener" style={{ color: "#E8EDF0" }}>{r.name}</a>
                      ) : (
                        <Link href={r.href} style={{ color: "#E8EDF0" }}>{r.name}</Link>
                      )
                    ) : (
                      r.name
                    )}
                    {r.href && r.hrefLabel && (
                      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".05em", color: "#5FE3E8", whiteSpace: "nowrap" }}>
                        {r.hrefLabel}{/^https?:\/\//.test(r.href) ? " ↗" : " →"}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "#83919A", marginTop: 2 }}>{r.note}</div>
                </div>
              </div>
              <div style={{ padding: "13px 18px", fontFamily: MONO, fontSize: 12.5, color: "#B7C4CB" }}>{r.m1}</div>
              <div style={{ padding: "13px 18px", fontFamily: MONO, fontSize: 12.5, color: "#B7C4CB" }}>{r.m2}</div>
              <div style={{ padding: "13px 18px", fontFamily: MONO, fontSize: 12.5, color: "#B7C4CB" }}>{r.m3}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 24px 64px" }}>
        <FeaturedPartner context={{ kind: "slots" }} />
        <ReportIssue subject={studio.name} />
        <NextSteps
          steps={[
            { href: db, label: `${studio.name} in the slot database`, hint: "Filter and sort every title by RTP, volatility and max win." },
            { href: "/providers", label: "Every studio", hint: "The studios we profile in depth, and every studio in the catalogue." },
            ...(se ? [{ href: se, label: `${studio.name} on SlotEssentials`, hint: "The studio's profile on our sister site, with tracker tools and record wins." }] : []),
          ]}
        />
      </section>
    </main>
  );
}
