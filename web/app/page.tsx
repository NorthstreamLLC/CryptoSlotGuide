import Link from "next/link";
import { ogCardPath } from "@/lib/og";
import { siteData, siteCounts } from "@/lib/site-data";
import { brandFor, casinoFacts } from "@/lib/casino-facts";
import { inHouseOrder } from "@/lib/house-order";
import { topSlotRows, slotArtBySlug } from "@/lib/slot-page";
import { publishedSeries, seriesPath, seriesRows } from "@/lib/slot-series";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { itemListSchema } from "@/lib/schema";
import { CodeChip } from "@/components/ui/CodeChip";
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";
import { CasinoRankList } from "@/components/casino-index/CasinoRankList";
import { LineIcon } from "@/components/ui/LineIcon";
import { DemoPlay } from "@/components/slots/DemoPlay";
import { demoTiles } from "@/lib/slot-demos";
import { StoryThumb, thumbForNews, type ThumbSpec } from "@/components/home/StoryThumb";
import { GeoSwap } from "@/components/promo/GeoSwap";
import { CGA_REGISTER } from "@/lib/curacao-register";
import { fill } from "@/lib/derived";
import { wheelWarsLive } from "@/lib/stake-wheel-wars";
import { BrandMark } from "@/components/ui/BrandMark";
import { getSpecFact } from "@/lib/spec-sheet";
import { PROMO_HUB, PROMO_PAGES } from "@/lib/promo-pages";
import { VERSUS_ANALYSIS } from "@/lib/versus-analysis";
import { parsePair } from "@/lib/versus";
import { FACT_ARTICLES } from "@/lib/fact-articles";
import { NEWS, NEWS_KIND, newsPath } from "@/lib/news";
import { newsArticles } from "@/lib/news-articles";
import { logoFor } from "@/lib/logo";
import { thumbOf } from "@/lib/thumb";
import { sportsbookOrder } from "@/lib/sports";
import { venuesInOrder } from "@/lib/prediction-markets";
import { raceSlugs } from "@/lib/races";

/**
 * The home page is the one page not built through pageMetadata(), so it was
 * the only page shipping without a canonical — the page most likely to be
 * reached as www, with a trailing slash, or on the deployment URL.
 */
export const metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    title: "CryptoSlotGuide — crypto casino, slot and wallet information",
    description:
      "Crypto casinos, sportsbooks, wallets and exchanges reviewed against their own terms, with every fact linked to its source.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website" as const,
    images: [{ url: ogCardPath("Crypto casinos, slots and sportsbooks — every figure sourced", "/"), width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" as const },
};

/** The facts the homepage teases: one fact from three articles, by slug and fact title. */
const FACT_PICKS: [string, string][] = [
  ["duel", "Its operator used to run CSGOEmpire"],
  ["razed", "The first players to reach its top ranks win a car"],
  ["roobet", "An affiliate code boosts your rakeback by 20% for 72 hours"],
];

/**
 * One visual system for the whole page: a single surface colour, hairline
 * borders, one accent (gold) kept for the buttons that lead to an offer, and
 * no glows or gradients behind content. Layout lives here as classes so the
 * markup below stays readable; the sitewide reduced-motion rule still applies.
 */
const CSS = `
.h-wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
.h-sec { padding-top: 88px; }
.h-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 22px; }
.h-h2 { margin: 0; font-size: 26px; line-height: 1.2; letter-spacing: -.025em; font-weight: 700; color: #F2F5F7; }
.h-more { font-size: 14.5px; font-weight: 600; color: #C9D3D8; white-space: nowrap; }
.h-more:hover { color: #fff; }
.h-box { border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: #0D1114; overflow: hidden; }
.h-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 13px 20px; border-radius: 11px; font-size: 15px; font-weight: 700; white-space: nowrap; transition: background .15s, border-color .15s, transform .15s; }
.h-btn:hover { transform: translateY(-1px); }
.h-btn-gold { background: #FFC531; color: #141007; }
.h-btn-gold:hover { background: #FFD45E; }
.h-btn-light { background: #F2F5F7; color: #0A0D0F; }
.h-btn-light:hover { background: #fff; }
.h-btn-line { border: 1px solid rgba(255,255,255,.16); color: #E8EDF0; }
.h-btn-line:hover { border-color: rgba(255,255,255,.32); }

/* Hero */
.h-hero { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr); grid-template-areas: "intro pick" "paths pick"; column-gap: 56px; align-items: center; padding: 52px 0 56px; }
.h-intro { grid-area: intro; align-self: end; }
.h-paths-wrap { grid-area: paths; align-self: start; }
.h-pick { grid-area: pick; }
.h-h1 { margin: 0 0 22px; font-size: clamp(38px, 5vw, 58px); line-height: 1.04; letter-spacing: -.04em; font-weight: 700; color: #F7F9FA; text-wrap: balance; }
.h-lead { margin: 0 0 30px; max-width: 50ch; font-size: 18px; line-height: 1.6; color: #98A6AE; }
.h-ctas { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 32px; }
.h-paths { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.h-path { position: relative; display: grid; grid-template-columns: auto 1fr auto; grid-template-areas: "ico . stack" "txt txt arrow"; align-items: center; row-gap: 14px; column-gap: 12px; padding: 20px; border-radius: 14px; border: 1px solid rgba(255,255,255,.09); background: #0D1114; box-shadow: inset 0 2px 0 var(--tint); transition: border-color .2s, transform .2s; }
.h-path:hover { transform: translateY(-2px); border-color: color-mix(in srgb, var(--tint) 55%, transparent); }
.h-path-ico { display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; flex: none; border-radius: 12px; background: color-mix(in srgb, var(--tint) 14%, transparent); border: 1px solid color-mix(in srgb, var(--tint) 35%, transparent); color: var(--tint); }
.h-path-ico svg { width: 22px; height: 22px; }
.h-path-txt { grid-area: txt; min-width: 0; }
.h-path-ico { grid-area: ico; }
.h-path .h-stack { grid-area: stack; }
.h-path i { grid-area: arrow; align-self: end; }
.h-stack { display: flex; flex: none; }
.h-stack > span { width: 24px; height: 24px; border-radius: 50%; overflow: hidden; border: 2px solid #0A0D10; background: #0A0D10; }
.h-stack > span + span { margin-left: -8px; }
.h-stack img { display: block; width: 100%; height: 100%; object-fit: cover; }
.h-path .h-stack > span { width: 30px; height: 30px; border-color: #0D1114; }
.h-path .h-stack > span + span { margin-left: -10px; }
.h-path b { display: block; font-size: 18px; font-weight: 700; letter-spacing: -.01em; color: #F2F5F7; }
.h-path small { display: block; margin-top: 3px; font-size: 13.5px; color: #8E9CA4; }
.h-path i { font-style: normal; color: #5E6B73; transition: transform .15s, color .15s; }
.h-path:hover i { transform: translateX(3px); color: var(--tint); }
.h-path:hover b { color: #fff; }

/* Latest: a lead story, four more, this month's casino changes, then live promotions */
.h-live { display: inline-flex; align-items: center; gap: 7px; margin-left: 12px; vertical-align: middle; font-size: 12.5px; font-weight: 600; letter-spacing: 0; color: #8E9CA4; }
.h-live i { width: 8px; height: 8px; border-radius: 50%; background: #57E39A; box-shadow: 0 0 0 4px rgba(87,227,154,.15); }
.h-front { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 16px; }
.h-lead-story { display: flex; flex-direction: column; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,.09); background: #0D1114; transition: border-color .15s, transform .15s; }
.h-lead-story:hover { border-color: rgba(255,255,255,.22); transform: translateY(-2px); }
.h-lead-cover { display: block; aspect-ratio: 16 / 7; }
.h-lead-body { display: flex; flex-direction: column; gap: 10px; padding: 20px 22px 22px; }
.h-lead-body b { font-size: 24px; line-height: 1.22; letter-spacing: -.02em; font-weight: 700; color: #F7F9FA; text-wrap: balance; }
.h-lead-sub { font-size: 15px; line-height: 1.6; color: #98A6AE; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.h-read { margin-top: 2px; font-size: 14px; font-weight: 700; color: #E8EDF0; }
.h-minis { display: flex; flex-direction: column; gap: 12px; }
.h-mini { flex: 1; display: grid; grid-template-columns: 132px minmax(0, 1fr); gap: 14px; align-items: center; padding: 10px; border-radius: 14px; border: 1px solid rgba(255,255,255,.08); background: #0D1114; transition: border-color .15s, transform .15s; }
.h-mini:hover { border-color: rgba(255,255,255,.2); transform: translateY(-1px); }
.h-mini-cover { display: block; aspect-ratio: 16 / 10; border-radius: 10px; overflow: hidden; }
.h-mini-brand { display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--tint) 16%, #0C1013); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tint) 35%, transparent); }
.h-mini-mark { width: 44px; height: 44px; border-radius: 10px; overflow: hidden; }
.h-mini-body { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.h-mini b { font-size: 15px; line-height: 1.35; font-weight: 600; color: #F2F5F7; }
.h-story-meta { display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: #75828A; }
.h-ltag { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11.5px; font-weight: 700; letter-spacing: .02em; color: var(--tint); background: color-mix(in srgb, var(--tint) 13%, transparent); }
.h-month { margin-top: 28px; }
.h-month-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.h-month-head h3 { margin: 0; font-size: 17px; font-weight: 700; color: #F2F5F7; }
.h-month-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
.h-mcard { display: flex; flex-direction: column; gap: 10px; padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,.08); background: #0D1114; box-shadow: inset 0 2px 0 var(--tint); transition: border-color .15s, transform .15s; }
.h-mcard:hover { border-color: color-mix(in srgb, var(--tint) 50%, transparent); transform: translateY(-1px); }
.h-mcard-top { display: flex; align-items: center; gap: 8px; }
.h-mcard-text { font-size: 14px; line-height: 1.45; color: #DCE3E7; }
.h-change-mark { width: 26px; height: 26px; flex: none; border-radius: 7px; overflow: hidden; }

.h-also { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; }
.h-chip { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px 6px 7px; border-radius: 100px; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.03); font-size: 13.5px; font-weight: 500; color: #C9D3D8; transition: border-color .15s, color .15s; }
.h-chip:hover { border-color: color-mix(in srgb, var(--tint) 60%, transparent); color: #fff; }
.h-chip .h-stack > span { width: 20px; height: 20px; }
.h-chip-dot { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--tint) 16%, transparent); color: var(--tint); }

.h-pick { padding: 26px; border: 1px solid rgba(255,197,49,.28); border-radius: 18px; background: #0F1316; }
.h-pick-top { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.h-tag { display: inline-block; padding: 3px 8px; border-radius: 6px; background: rgba(255,197,49,.12); color: #FFC531; font-size: 11.5px; font-weight: 700; letter-spacing: .02em; }
.h-pick-title { margin: 0 0 8px; font-size: 24px; line-height: 1.2; letter-spacing: -.02em; font-weight: 700; color: #fff; }
.h-pick-line { margin: 0 0 20px; font-size: 14.5px; line-height: 1.55; color: #98A6AE; }
.h-pick-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 0 0 22px; border: 1px solid rgba(255,255,255,.07); border-radius: 12px; }
.h-pick-steps div { padding: 11px 12px; }
.h-pick-steps div + div { border-left: 1px solid rgba(255,255,255,.07); }
.h-pick-steps b { display: block; font-size: 15px; font-weight: 700; color: #F2F5F7; }
.h-pick-steps small { display: block; margin-top: 2px; font-size: 11.5px; line-height: 1.35; color: #7E8C94; }
.h-pick-actions { display: flex; flex-direction: column; gap: 10px; }
.h-fine { margin: 12px 0 0; font-size: 11.5px; line-height: 1.55; color: #67747C; }

/* Promo strip */
.h-strip { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding: 14px 18px; border: 1px solid color-mix(in srgb, var(--tint, #ffffff) 22%, rgba(255,255,255,.06)); border-radius: 14px; background: color-mix(in srgb, var(--tint, #0D1114) 7%, #0D1114); box-shadow: inset 3px 0 0 var(--tint, rgba(255,255,255,.2)); font-size: 14.5px; color: #A9B5BC; transition: border-color .15s, transform .15s; }
.h-strip:hover { border-color: color-mix(in srgb, var(--tint, #ffffff) 55%, transparent); transform: translateY(-1px); }
.h-strip .csg-strip-tag { background: color-mix(in srgb, var(--tint, #ffffff) 16%, transparent); color: var(--tint, #DCE3E7); }
.h-strip .csg-strip-cta { color: var(--tint, #E8EDF0); }
.h-strip strong { color: #F2F5F7; font-weight: 600; }
.csg-strip-tag { padding: 3px 8px; border-radius: 6px; background: rgba(255,255,255,.07); color: #DCE3E7; font-size: 11.5px; font-weight: 700; white-space: nowrap; }
.csg-strip-text { flex: 1 1 320px; }
.csg-strip-cta { font-weight: 600; color: #E8EDF0; white-space: nowrap; }

/* Codes + comparisons */
.h-two { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); gap: 20px; }
.h-sub { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,.06); }
.h-sub h3 { margin: 0; font-size: 16px; font-weight: 700; color: #F2F5F7; }
.h-li { display: flex; align-items: center; gap: 12px; padding: 12px 20px; }
.h-li + .h-li { border-top: 1px solid rgba(255,255,255,.05); }
.h-li-main { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.h-li-main b { display: block; font-size: 15px; font-weight: 600; color: #EEF2F4; }
.h-li-main small { display: block; font-size: 13px; line-height: 1.4; color: #7E8C94; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
a.h-li:hover b, .h-li-main:hover b { color: #fff; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: rgba(255,255,255,.3); }
.h-vs { color: #6F7C84; font-weight: 500; }
.h-pair { display: flex; flex: none; }
.h-pair span { width: 26px; height: 26px; border-radius: 50%; overflow: hidden; border: 2px solid #0D1114; background: #0D1114; }
.h-pair span + span { margin-left: -8px; }

/* Slots */
.h-slots { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.h-slot { display: block; }
.h-demo-badge { display: inline-flex; align-items: center; gap: 10px; margin: -14px 0 28px; padding: 7px 14px 7px 7px; border-radius: 100px; border: 1px solid rgba(255,197,49,.4); background: rgba(255,197,49,.08); font-size: 14px; color: #C9D3D8; transition: border-color .15s, background .15s; }
.h-demo-badge:hover { border-color: #FFC531; background: rgba(255,197,49,.14); }
.h-demo-badge b { color: #FFC531; font-weight: 700; }
.h-demo-badge-play { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; flex: none; border-radius: 50%; background: #FFC531; color: #141007; font-size: 11px; padding-left: 2px; }
.h-demo-badge i { font-style: normal; color: #FFC531; }
@media (max-width: 560px) { .h-demo-badge { margin: 14px 0 6px; font-size: 13px; } }
.h-demos { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px; }
.h-demo { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.h-demo-art { position: relative; margin-bottom: 6px; }
.h-demo-art .dp-disc { width: 50px; height: 50px; }
.h-demo-art .dp-label { display: none; font-size: 12px; }
.h-demo:hover .h-demo-art .dp-label { display: inline-block; }
.h-demo-name { font-size: 14.5px; font-weight: 700; color: #F2F5F7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
a.h-demo-name:hover { color: #FFC531; }
.h-demo small { font-size: 12.5px; color: #8E9CA4; }
.h-demo-sub { margin: 6px 0 0; font-size: 14px; color: #8E9CA4; }
@media (max-width: 960px) { .h-demos { grid-auto-flow: column; grid-template-columns: none; grid-auto-columns: minmax(180px, 46%); overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 6px; } .h-demo { scroll-snap-align: start; } }
.h-slot-art { display: block; aspect-ratio: 16 / 10; border-radius: 12px; overflow: hidden; background: #11161A; border: 1px solid rgba(255,255,255,.06); }
.h-slot-art img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .4s ease; }
.h-slot:hover .h-slot-art img { transform: scale(1.03); }
.h-slot b { display: block; margin-top: 12px; font-size: 15px; font-weight: 600; color: #EEF2F4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.h-slot small { display: block; margin-top: 2px; font-size: 13px; color: #75828A; }

/* Facts */
.h-facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.h-fact { display: flex; flex-direction: column; gap: 10px; padding: 20px; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: #0D1114; transition: border-color .15s; }
.h-fact:hover { border-color: rgba(255,255,255,.18); }
.h-fact-who { display: flex; align-items: center; gap: 9px; font-size: 13px; color: #8E9CA4; }
.h-fact b { font-size: 17px; line-height: 1.35; font-weight: 600; color: #F2F5F7; }
.h-fact small { margin-top: auto; font-size: 13.5px; color: #A9B5BC; }

/* Trust */
.h-trust { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px; padding: 28px 0 0; border-top: 1px solid rgba(255,255,255,.08); }
.h-trust b { display: block; margin-bottom: 6px; font-size: 15.5px; font-weight: 600; color: #F2F5F7; }
.h-trust p { margin: 0; font-size: 14px; line-height: 1.55; color: #8A98A0; }

@media (max-width: 960px) {
  .h-hero { grid-template-columns: 1fr; grid-template-areas: "intro" "pick" "paths"; row-gap: 32px; padding: 48px 0 40px; }
  .h-ctas { margin-bottom: 0; }
  .h-two { grid-template-columns: 1fr; }
  .h-front { grid-template-columns: 1fr; }
  .h-month-grid { grid-auto-flow: column; grid-template-columns: none; grid-auto-columns: minmax(220px, 70%); overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 6px; }
  .h-mcard { scroll-snap-align: start; }
  .h-slots { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .h-facts, .h-trust { grid-template-columns: 1fr; gap: 14px; }
  .h-trust { gap: 22px; }
}
@media (max-width: 560px) {
  .h-wrap { padding: 0 16px; }
  .h-sec { padding-top: 64px; }
  .h-paths { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .h-path { grid-template-areas: "ico ico ico" "txt txt txt"; row-gap: 10px; }
  .h-path i { display: none; }
  .h-path b { font-size: 16px; }
  .h-path { padding: 15px; }
  .h-path .h-stack { display: none; }
  .h-pick { padding: 20px; }
  .h-li { padding: 12px 16px; }
  .h-sub { padding: 14px 16px; }
}
`;

/** A row of overlapping round logos (or slot art, or flags). */
function Stack({ imgs }: { imgs: string[] }) {
  if (!imgs.length) return null;
  return (
    <span className="h-stack" aria-hidden>
      {imgs.map((src, i) => (
        <span key={src} style={{ zIndex: imgs.length - i }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" width={24} height={24} loading="lazy" decoding="async" />
        </span>
      ))}
    </span>
  );
}

type MiniItem = { href: string; tag: string; tint: string; title: string; date: string; thumb: ThumbSpec };
const miniDate = (iso: string) => (iso ? new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "");

/** A story in the Latest column: cover tile, tag and date, headline. */
function MiniStory({ x }: { x: MiniItem }) {
  return (
    <Link href={x.href} className="h-mini">
      <span className="h-mini-cover"><StoryThumb spec={x.thumb} size="mini" /></span>
      <span className="h-mini-body">
        <span className="h-story-meta">
          <span className="h-ltag" style={{ ["--tint" as string]: x.tint }}>{x.tag}</span>
          {miniDate(x.date)}
        </span>
        <b>{x.title}</b>
      </span>
    </Link>
  );
}

export default function HomePage() {
  const { ops } = siteData;
  const c = siteCounts;
  const top = inHouseOrder(ops.filter((o) => !!casinoFacts(o).offer && !/^advertised/i.test(casinoFacts(o).headline))).slice(0, 6);
  const roobet = ops.find((o) => o.slug === "roobet");

  const rooJackpots = !!getSpecFact("roobet", "Bonus terms", "Roo Jackpots");

  // The four best-known series for the homepage row; the rest are one click away.
  // Six famous games for the homepage's free-demo row, in this order where we hold their demo.
  const allDemos = demoTiles();
  const demoCount = allDemos.length;
  const homeDemos = ["gates-of-olympus", "sweet-bonanza", "wanted-dead-or-a-wild", "book-of-dead", "big-bass-bonanza", "sugar-rush"]
    .map((slug) => allDemos.find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => !!t);

  const homeSeries = ["gates-of-olympus", "big-bass", "sweet-bonanza", "le-series"]
    .map((slug) => publishedSeries().find((x) => x.slug === slug))
    .filter((x): x is NonNullable<typeof x> => !!x)
    .map((x) => ({ s: x, art: slotArtBySlug(x.hero), count: seriesRows(x).length }));

  // Latest: news articles plus the data releases readers can use, newest first.
  // The trackers' dates are when each was first published.
  const typeTag = { news: "News", analysis: "Analysis", opinion: "Opinion" } as const;
  const assessCount = CGA_REGISTER.counts.find((x) => x.key === "assess")?.n;
  const latest = [
    ...newsArticles().slice(0, 4).map((g) => ({ href: `/guides/${g.slug}`, tag: g.contentType ? typeTag[g.contentType] : "News", tint: g.contentType && g.contentType !== "news" ? "#FFC531" : "#5FE3E8", title: g.title, sub: fill(g.standfirst, siteData), date: g.iso, thumb: thumbForNews(g.title, { category: g.category, tint: g.tint }) })),
    { href: "/crypto-casinos/kyc-tracker", tag: "New tracker", tint: "#57E39A", title: "KYC tracker: when each of 46 crypto casinos asks for ID", sub: "All 46 casinos sorted by when their own terms say they'll ask for ID, with each one's wording and source.", date: "2026-11-11", thumb: { kind: "kyc" } as ThumbSpec },
    { href: "/bonuses/true-cost-index", tag: "New index", tint: "#57E39A", title: "Bonus true-cost index: what each welcome bonus really costs per $100", sub: "The bets each welcome bonus asks for on a $100 deposit, and what that betting costs on average, from each casino's own terms.", date: "2026-11-10", thumb: { kind: "cost" } as ThumbSpec },
    { href: "/legal/curacao-licence-tracker", tag: "Tracker", tint: "#57E39A", title: "Curaçao licence tracker: where each crypto casino stands on the register", sub: `${assessCount ?? "Hundreds"} of ${CGA_REGISTER.total} licences on the regulator's own register read "Assessment in progress". Where each casino we track stands.`, date: "2026-11-06", thumb: { kind: "register" } as ThumbSpec },
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
  const [leadStory, ...moreStories] = latest;
  // Live promotions take two of the four story slots; where the casino doesn't
  // accept the visitor, the slot shows the next story instead (GeoSwap).
  const promos = [
    ...(rooJackpots ? [{ slug: "roobet", href: "/guides/roo-jackpots-explained", tag: "New at Roobet", tint: brandFor("roobet"), when: "Live now", title: "Roo Jackpots: four jackpots, the biggest from $250,000, with no wagering on wins" }] : []),
    ...(wheelWarsLive() ? [{ slug: "stake", href: "/promo-codes/stake#wheel-wars", tag: "At Stake", tint: brandFor("stake"), when: "Until 2 Jan", title: "Stake Wheel Wars: $150,000 a month in Pragmatic Play prizes" }] : []),
  ];
  type Story = (typeof latest)[number];
  const miniSlots: { story?: Story; promo?: (typeof promos)[number]; fallback?: Story }[] = (() => {
    const out: { story?: Story; promo?: (typeof promos)[number]; fallback?: Story }[] = [];
    const queue = [...moreStories];
    const lead = Math.max(0, 4 - promos.length);
    for (let i = 0; i < lead && queue.length; i++) out.push({ story: queue.shift() });
    for (const p of promos) out.push({ promo: p, fallback: queue.shift() });
    return out.slice(0, 4);
  })();
  const shortDate = (iso: string) => (iso ? new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "");
  const issue = NEWS[0];

  const rank = { perk: 0, welcome: 1, rewards: 2 } as const;
  const codes = inHouseOrder(ops.filter((o) => PROMO_PAGES.includes(o.slug) && PROMO_HUB[o.slug] && o.promoCode && o.signupUrl))
    .sort((a, b) => rank[PROMO_HUB[a.slug].kind] - rank[PROMO_HUB[b.slug].kind])
    .slice(0, 6);
  const pairs = Object.keys(VERSUS_ANALYSIS)
    .slice(0, 6)
    .flatMap((k) => {
      const p = parsePair(k);
      return p ? [{ k, a: p[0], b: p[1] }] : [];
    });

  const facts = FACT_PICKS.flatMap(([slug, title]) => {
    const o = ops.find((x) => x.slug === slug);
    const a = FACT_ARTICLES[slug];
    const f = a?.facts.find((x) => x.title === title);
    // A teaser only shows while its fact and source are still on the article.
    return o && f && getSpecFact(slug, f.group, f.label)?.sourceUrl ? [{ o, f, n: a.facts.indexOf(f) + 1 }] : [];
  });
  const factTotal = Object.values(FACT_ARTICLES).reduce((n, a) => n + a.facts.length, 0);

  const logo = (slug: string) => logoFor(slug);
  const casinoImgs = top.slice(0, 3).flatMap((o) => (logo(o.slug) ? [logo(o.slug)!] : []));
  const codeImgs = codes.filter((o) => !top.slice(0, 3).includes(o)).slice(0, 3).flatMap((o) => (logo(o.slug) ? [logo(o.slug)!] : []));
  const slotImgs = topSlotRows().slice(0, 3).flatMap((r) => (r.image ? [thumbOf(r.image)] : []));
  const paths = [
    { t: "Find a casino", d: `${c.casinos} casinos compared`, href: "/crypto-casinos", tint: "#2FD3DA", icon: <LineIcon name="casino" />, imgs: casinoImgs },
    { t: "Bonuses & codes", d: "Wagering spelled out", href: "/bonuses", tint: "#FFC531", icon: <LineIcon name="gift" />, imgs: codeImgs },
    { t: "Top slots", d: "RTP and free demos", href: "/slots", tint: "#FF7EB6", icon: <LineIcon name="slots" />, imgs: slotImgs },
    { t: "Can I play here?", d: "The law where you live", href: "/legal", tint: "#57E39A", icon: <LineIcon name="globe" />, imgs: ["gb", "ca", "br"].map((f) => `/assets/flags/${f}.svg`) },
  ];
  const stackOf = (slugs: string[], n: number) => slugs.flatMap((s) => (logo(s) ? [logo(s)!] : [])).slice(0, n);
  const also = [
    { t: "Sportsbooks", href: "/sportsbooks", tint: "#57E39A", imgs: stackOf(sportsbookOrder().map((o) => o.slug), 3) },
    { t: "Prediction markets", href: "/prediction-markets", tint: "#B284FF", imgs: stackOf([...venuesInOrder("crypto"), ...venuesInOrder("fiat")].map((v) => v.slug), 3) },
    { t: "Wallets", href: "/wallets", tint: "#5FA8FF", imgs: stackOf(["metamask", "phantom", "ledger", "trust-wallet"], 3) },
    { t: "Races", href: "/races", tint: "#FF9A5C", imgs: stackOf(raceSlugs(), 3) },
  ];

  return (
    <>
      {/* Organization and WebSite are sitewide in layout.tsx; the home page
          adds the casino list it leads with, in the same order. */}
      <JsonLd data={[itemListSchema("Crypto casinos we recommend", top.map((o) => ({ name: o.name, path: `/casinos/${o.slug}` })))]} />
      <style>{CSS}</style>
      <main style={{ background: "#080B0D", paddingBottom: 96 }}>
        <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)", background: "radial-gradient(60% 80% at 15% 0%, rgba(0,194,204,.07), transparent 70%), #0A0D10" }}>
          <div className="h-wrap">
            <section className="h-hero">
              <div className="h-intro">
                <h1 className="h-h1">Crypto casinos, checked against their own terms.</h1>
                <p className="h-lead">Bonuses, payout times and RTP from each casino&apos;s and studio&apos;s own pages, with the source linked beside every figure.</p>
                <div className="h-ctas">
                  <Link href="/crypto-casinos" className="h-btn h-btn-light">Compare casinos</Link>
                  <Link href="/promo-codes" className="h-btn h-btn-line">Promo codes</Link>
                </div>
                <Link href="/slots/free-demos" className="h-demo-badge">
                  <span className="h-demo-badge-play" aria-hidden>▶</span>
                  <span>
                    <b>Play {Math.floor(demoCount / 100) * 100}+ slots free</b> · right here, no account
                  </span>
                  <i aria-hidden>→</i>
                </Link>
              </div>
              <div className="h-paths-wrap">
                <nav aria-label="Start here" className="h-paths">
                  {paths.map((p) => (
                    <Link key={p.href} href={p.href} className="h-path" style={{ ["--tint" as string]: p.tint }}>
                      <span className="h-path-ico" aria-hidden>{p.icon}</span>
                      <span className="h-path-txt">
                        <b>{p.t}</b>
                        <small>{p.d}</small>
                      </span>
                      <Stack imgs={p.imgs} />
                      <i aria-hidden>→</i>
                    </Link>
                  ))}
                </nav>
                <div className="h-also">
                  {also.map((x) => (
                    <Link key={x.href} href={x.href} className="h-chip" style={{ ["--tint" as string]: x.tint }}>
                      {x.imgs.length ? <Stack imgs={x.imgs} /> : <span className="h-chip-dot" aria-hidden><LineIcon name="book" size={12} /></span>}
                      {x.t}
                    </Link>
                  ))}
                </div>
              </div>

              {roobet?.promoCode && (
                <aside className="h-pick" aria-label="Our pick">
                  <div className="h-pick-top">
                    <span style={{ width: 44, height: 44, flex: "none", borderRadius: 12, overflow: "hidden" }}>
                      <BrandMark slug="roobet" mono={roobet.mono} tint={brandFor("roobet")} radius={12} fontSize={13} />
                    </span>
                    <span>
                      <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: "#F2F5F7" }}>Roobet</span>
                      <span className="h-tag">Our pick</span>
                    </span>
                  </div>
                  <p className="h-pick-title">20% up to $500 + up to 600 free spins</p>
                  <p className="h-pick-line">Sign up with code {roobet.promoCode}, then claim the package through CasinoPerks, the casino VIP team, on Telegram.</p>
                  <div className="h-pick-steps" data-keep-grid>
                    <div><b>20%</b><small>deposit match to $500</small></div>
                    <div><b>100 spins</b><small>at $10,000 wagered</small></div>
                    <div><b>500 spins</b><small>at $50,000 wagered</small></div>
                  </div>
                  <div className="h-pick-actions">
                    <CodeChip code={roobet.promoCode} tint="#FFC531" />
                    <Link href="/promo-codes/roobet" className="h-btn h-btn-gold">Get the Roobet offer</Link>
                  </div>
                  <GeoBlockNote slug="roobet" name={roobet.name} compact />
                  <p className="h-fine">18+ · T&amp;Cs apply · Affiliate offer: we may earn a commission.</p>
                </aside>
              )}
            </section>
          </div>
        </div>

        <div className="h-wrap">
          {/* Latest */}
          <section style={{ paddingTop: 56 }}>
            <div className="h-head">
              <h2 className="h-h2">
                Latest <span className="h-live"><i aria-hidden /> Updated {shortDate(leadStory?.date ?? "")}</span>
              </h2>
              <Link href="/news" className="h-more">All news →</Link>
            </div>
            {leadStory && (
              <div className="h-front">
                <Link href={leadStory.href} className="h-lead-story">
                  <span className="h-lead-cover"><StoryThumb spec={leadStory.thumb} size="lead" /></span>
                  <span className="h-lead-body">
                    <span className="h-story-meta">
                      <span className="h-ltag" style={{ ["--tint" as string]: leadStory.tint }}>{leadStory.tag}</span>
                      {shortDate(leadStory.date)}
                    </span>
                    <b>{leadStory.title}</b>
                    <span className="h-lead-sub">{leadStory.sub}</span>
                    <span className="h-read">Read it →</span>
                  </span>
                </Link>
                <div className="h-minis">
                  {miniSlots.map((slot, i) =>
                    slot.promo ? (
                      <GeoSwap key={slot.promo.href} slug={slot.promo.slug} fallback={slot.fallback ? <MiniStory x={slot.fallback} /> : null}>
                        <Link href={slot.promo.href} className="h-mini">
                          <span className="h-mini-cover"><StoryThumb spec={{ kind: "casino", slug: slot.promo.slug }} size="mini" /></span>
                          <span className="h-mini-body">
                            <span className="h-story-meta">
                              <span className="h-ltag" style={{ ["--tint" as string]: slot.promo.tint }}>{slot.promo.tag}</span>
                              {slot.promo.when}
                            </span>
                            <b>{slot.promo.title}</b>
                          </span>
                        </Link>
                      </GeoSwap>
                    ) : slot.story ? (
                      <MiniStory key={slot.story.href + i} x={slot.story} />
                    ) : null
                  )}
                </div>
              </div>
            )}
            {issue && (
              <div className="h-month">
                <div className="h-month-head">
                  <h3>This month at the casinos</h3>
                  <Link href={newsPath(issue.month)} className="h-more">All {issue.items.length} changes →</Link>
                </div>
                <div className="h-month-grid">
                  {issue.items.slice(0, 5).map((it, i) => {
                    const o = siteData.ops.find((x) => x.slug === it.slug);
                    return (
                      <Link key={i} href={newsPath(issue.month)} className="h-mcard" style={{ ["--tint" as string]: NEWS_KIND[it.kind].tint }}>
                        <span className="h-mcard-top">
                          {o && (
                            <span className="h-change-mark">
                              <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={7} fontSize={9} />
                            </span>
                          )}
                          <span className="h-ltag">{NEWS_KIND[it.kind].label}</span>
                        </span>
                        <span className="h-mcard-text">{it.headline}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Free demos: playable from the homepage itself */}
          {homeDemos.length > 0 && (
            <section className="h-sec">
              <div className="h-head">
                <div>
                  <h2 className="h-h2">Play free, right here</h2>
                  <p className="h-demo-sub">The studio&apos;s own demo: play money, no account, no deposit, open wherever you are.</p>
                </div>
                <Link href="/slots/free-demos" className="h-more">All {demoCount.toLocaleString("en-GB")} free demos →</Link>
              </div>
              <div className="h-demos">
                {homeDemos.map((t) => (
                  <div key={t.slug} className="h-demo">
                    <span className="h-slot-art h-demo-art">
                      {t.art && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.art} alt={`${t.name} game art`} width={320} height={200} loading="lazy" decoding="async" />
                      )}
                      <DemoPlay url={t.url} name={t.name} studio={t.studio} slug={t.slug} />
                    </span>
                    {t.page ? <Link href={t.page} className="h-demo-name">{t.name}</Link> : <b className="h-demo-name">{t.name}</b>}
                    <small>{t.studio}{t.rtp ? ` · RTP ${t.rtp.split(/\s*[–-]\s*/)[0]}` : ""}</small>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Top casinos */}
          <section className="h-sec" id="top-offers" style={{ scrollMarginTop: 120 }}>
            <div className="h-head">
              <h2 className="h-h2">Top crypto casinos</h2>
              <Link href="/crypto-casinos" className="h-more">Compare all {c.casinos} →</Link>
            </div>
            <CasinoRankList ops={top} />
          </section>

          {/* Codes and comparisons */}
          <section className="h-sec">
            <div className="h-head">
              <h2 className="h-h2">Codes and comparisons</h2>
            </div>
            <div className="h-two">
              <div className="h-box">
                <div className="h-sub">
                  <h3>Promo codes</h3>
                  <Link href="/promo-codes" className="h-more" style={{ fontSize: 13.5 }}>All {PROMO_PAGES.length} →</Link>
                </div>
                {codes.map((o) => (
                  <div key={o.slug} className="h-li">
                    <Link href={`/promo-codes/${o.slug}`} className="h-li-main">
                      <span style={{ width: 34, height: 34, flex: "none", borderRadius: 9, overflow: "hidden" }}>
                        <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={9} fontSize={11} />
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <b>{o.name}</b>
                        <small>{o.codePerk?.short ?? PROMO_HUB[o.slug].line}</small>
                      </span>
                    </Link>
                    <CodeChip code={o.promoCode!} tint="#FFC531" size="sm" />
                  </div>
                ))}
              </div>
              <div className="h-box">
                <div className="h-sub">
                  <h3>Head to head</h3>
                  <Link href="/compare" className="h-more" style={{ fontSize: 13.5 }}>All comparisons →</Link>
                </div>
                {pairs.map(({ k, a, b }) => (
                  <Link key={k} href={`/compare/${k}`} className="h-li">
                    <span className="h-pair" aria-hidden>
                      {[a, b].map((o) => (
                        <span key={o.slug}>
                          <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={13} fontSize={9} />
                        </span>
                      ))}
                    </span>
                    <span className="h-li-main">
                      <b>
                        {a.name} <span className="h-vs">vs</span> {b.name}
                      </b>
                    </span>
                    <span aria-hidden style={{ color: "#5E6B73" }}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Top slots */}
          <section className="h-sec">
            <div className="h-head">
              <h2 className="h-h2">Top slots right now</h2>
              <Link href="/slots" className="h-more">All top slots →</Link>
            </div>
            <div className="h-slots">
              {topSlotRows()
                .slice(0, 4)
                .map((r) => (
                  <Link key={r.slug} href={`/slots/${r.slug}`} className="h-slot">
                    <span className="h-slot-art">
                      {r.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.image} alt={r.name} width={320} height={200} loading="lazy" decoding="async" />
                      )}
                    </span>
                    <b>{r.name}</b>
                    <small>
                      {r.provider} · {r.rtp} RTP
                    </small>
                  </Link>
                ))}
            </div>
          </section>

          {/* Slot series */}
          {homeSeries.length > 0 && (
            <section className="h-sec">
              <div className="h-head">
                <h2 className="h-h2">Slot series</h2>
                <Link href="/slots/series" className="h-more">All {publishedSeries().length} series →</Link>
              </div>
              <div className="h-slots">
                {homeSeries.map(({ s, art, count }) => (
                  <Link key={s.slug} href={seriesPath(s)} className="h-slot">
                    <span className="h-slot-art">
                      {art && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={art} alt={`${s.name} game art`} width={320} height={200} loading="lazy" decoding="async" />
                      )}
                    </span>
                    <b>{s.name}</b>
                    <small>
                      {s.studio} · {count} games
                    </small>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Facts */}
          {facts.length > 0 && (
            <section className="h-sec">
              <div className="h-head">
                <h2 className="h-h2">Worth knowing before you sign up</h2>
                <span style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {NEWS[0] && <Link href={newsPath(NEWS[0].month)} className="h-more">What changed this month →</Link>}
                  <Link href="/casinos/facts" className="h-more">All {factTotal} facts →</Link>
                </span>
              </div>
              <div className="h-facts">
                {facts.map(({ o, f, n }) => (
                  <Link key={o.slug} href={`/casinos/${o.slug}/facts#fact-${n}`} className="h-fact">
                    <span className="h-fact-who">
                      <span style={{ width: 24, height: 24, flex: "none", borderRadius: 6, overflow: "hidden" }}>
                        <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={6} fontSize={8} />
                      </span>
                      {o.name}
                    </span>
                    <b>{f.title}</b>
                    <small>More about {o.name} →</small>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* How we work */}
          <section className="h-sec">
            <div className="h-trust">
              {[
                { t: "Sourced, not copied", d: "Every fact links to the casino's, studio's or regulator's own page." },
                { t: "Re-checked every month", d: "Bonuses and payout terms are re-read, and every change is logged." },
                { t: "Paid links, clearly marked", d: "We earn from some links. It never changes what a review says." },
              ].map((x) => (
                <div key={x.t}>
                  <b>{x.t}</b>
                  <p>{x.d}</p>
                </div>
              ))}
            </div>
            <p style={{ margin: "20px 0 0" }}>
              <Link href="/how-we-rate" className="h-more">How we rate →</Link>
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
