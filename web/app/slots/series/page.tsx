import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { LandingShell } from "@/components/landing/LandingShell";
import { NextSteps } from "@/components/layout/NextSteps";
import { publishedSeries, seriesRows, seriesStats, seriesPath } from "@/lib/slot-series";
import { slotArtBySlug } from "@/lib/slot-page";

export const metadata = pageMetadata(
  "Slot series: Gates of Olympus, Sweet Bonanza, Big Bass and more",
  "Every game in the biggest slot series, from Gates of Olympus and Sweet Bonanza to Big Bass and Hacksaw's Le series, with RTP, volatility and max win side by side.",
  "/slots/series"
);

export default function Page() {
  const series = publishedSeries().map((s) => ({ s, st: seriesStats(seriesRows(s)), art: slotArtBySlug(s.hero) }));
  return (
    <>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Slots", path: "/slots" }, { name: "Slot series", path: "/slots/series" }]), itemListSchema("Slot series", series.map(({ s }) => ({ name: `${s.name} slots`, path: seriesPath(s) })))]} />
      <LandingShell
        crumbs={[{ label: "Home", href: "/" }, { label: "Slots", href: "/slots" }, { label: "Series" }]}
        eyebrow="Slots by series"
        title="Slot series"
        intro="The game families studios keep building on: one formula, many editions. Each series page puts every game side by side, with its return, volatility and top prize."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 14, marginBottom: 30 }}>
          {series.map(({ s, st, art }) => (
            <Link key={s.slug} href={seriesPath(s)} className="csg-lift" style={{ display: "flex", flexDirection: "column", gap: 10, padding: art ? "0 0 20px" : "20px 22px", borderRadius: 14, overflow: "hidden", background: "#0C1013", border: "1px solid rgba(255,255,255,.08)", boxShadow: `inset 0 2px 0 ${s.tint}` }}>
              {art && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={art} alt={`${s.name} game art`} width={640} height={360} loading="lazy" decoding="async" style={{ display: "block", width: "100%", aspectRatio: "16 / 9", objectFit: "cover", marginBottom: 6 }} />
              )}
              <span style={{ padding: art ? "0 22px" : 0, fontSize: 12, fontWeight: 600, color: s.tint }}>{s.studio}</span>
              <span style={{ padding: art ? "0 22px" : 0, fontSize: 20, fontWeight: 700, letterSpacing: "-.015em", color: "#fff" }}>{s.name}</span>
              <span style={{ padding: art ? "0 22px" : 0, fontSize: 14, lineHeight: 1.55, color: "#A8B6BE" }}>
                {st.count} games{st.rtpLow ? ` · RTP ${st.rtpLow === st.rtpHigh ? `${st.rtpHigh}%` : `${st.rtpLow}–${st.rtpHigh}%`}` : ""}{st.top ? ` · up to ${st.top.maxWin}` : ""}
              </span>
              <span style={{ padding: art ? "0 22px" : 0, fontSize: 14, fontWeight: 700, color: "#E8EDF0" }}>See all {st.count} →</span>
            </Link>
          ))}
        </div>
        <NextSteps
          steps={[
            { href: "/slots", label: "All slots", hint: "Reviews, RTP and where to play each game." },
            { href: "/rtp-watch", label: "RTP Watch", hint: "Which returns each casino actually runs." },
            { href: "/providers", label: "Game studios", hint: "Every studio and its full title list." },
          ]}
        />
      </LandingShell>
    </>
  );
}
