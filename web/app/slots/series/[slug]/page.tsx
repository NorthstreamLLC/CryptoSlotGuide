import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { LandingShell } from "@/components/landing/LandingShell";
import { TitlesTable } from "@/components/studios/TitlesTable";
import { NextSteps } from "@/components/layout/NextSteps";
import { publishedSeries, seriesBySlug, seriesRows, seriesStats, seriesPath, seriesTitle } from "@/lib/slot-series";

export function generateStaticParams() {
  return publishedSeries().map((s) => ({ slug: s.slug }));
}
export const dynamicParams = false;

const studioPath = (studio: string) => `/providers/${studio.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = seriesBySlug(slug);
  if (!s) return {};
  const st = seriesStats(seriesRows(s));
  return pageMetadata(
    `${seriesTitle(s)}: every game in the series`,
    `All ${st.count} ${s.name} slots from ${s.studio}${st.rtpLow ? `, with returns from ${st.rtpLow}% to ${st.rtpHigh}%` : ""}${st.top ? ` and a top prize of ${st.top.maxWin} on ${st.top.name}` : ""}. RTP, volatility and max win for each, side by side.`,
    seriesPath(s)
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = seriesBySlug(slug);
  if (!s) notFound();
  const rows = seriesRows(s);
  if (rows.length < 3) notFound();
  const st = seriesStats(rows);
  const others = publishedSeries().filter((x) => x.slug !== s.slug);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Slots", path: "/slots" }, { name: "Slot series", path: "/slots/series" }, { name: s.name, path: seriesPath(s) }]),
          itemListSchema(`${s.name} slots`, rows.filter((r) => r.href?.startsWith("/")).map((r) => ({ name: r.name, path: r.href! }))),
        ]}
      />
      <LandingShell
        crumbs={[{ label: "Home", href: "/" }, { label: "Slots", href: "/slots" }, { label: "Series", href: "/slots/series" }, { label: s.name }]}
        eyebrow={`${s.studio} · slot series`}
        title={seriesTitle(s)}
        intro={s.blurb}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 22 }}>
          {[
            [String(st.count), "games in the series"],
            [st.rtpLow ? (st.rtpLow === st.rtpHigh ? `${st.rtpHigh}%` : `${st.rtpLow}–${st.rtpHigh}%`) : "—", st.rtpLow !== st.rtpHigh ? "RTP range across published builds" : "RTP"],
            [st.top ? st.top.maxWin : "—", st.top ? `top prize, ${st.top.name}` : "top prize"],
            [st.volMode ?? "—", st.volMode ? `volatility on ${st.volModeCount} of ${st.count}` : "volatility"],
          ].map(([v, k]) => (
            <div key={k} style={{ padding: "16px 18px", borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)", boxShadow: `inset 0 2px 0 ${s.tint}` }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#F2F5F7", fontVariantNumeric: "tabular-nums" }}>{v}</div>
              <div style={{ fontSize: 13, color: "#8E9CA4", marginTop: 4 }}>{k}</div>
            </div>
          ))}
        </div>
        <TitlesTable rows={rows} />
        <p style={{ margin: "12px 0 30px", fontSize: 13, lineHeight: 1.6, color: "#75828A" }}>
          Figures as on each game&apos;s row in {s.studio}&apos;s <Link href={studioPath(s.studio)} style={{ color: "#A8B6BE" }}>full title list</Link>: the studio&apos;s own published returns where we hold its sheet, labelled where a figure comes from the catalogue instead. Games with a page of ours are listed first. A casino can run any of the published returns, so check the figure in the game&apos;s info screen before you play.
        </p>
        <NextSteps
          steps={[
            ...others.slice(0, 2).map((x) => ({ href: seriesPath(x), label: seriesTitle(x), hint: `${x.studio}'s ${x.name} series.` })),
            { href: "/slots/series", label: "Every slot series", hint: "All the series we track, side by side." },
          ]}
        />
      </LandingShell>
    </>
  );
}
