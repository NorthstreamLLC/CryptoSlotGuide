import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { querySlots, catalogueTotals, catalogueAsOf } from "@/lib/slot-db";
import { STUDIOS } from "@/lib/studios";
import { studioHref } from "@/lib/studio-pages";
import { slotArtBySlug } from "@/lib/slot-page";
import { pageMetadata } from "@/lib/seo";
import { articleSchema, breadcrumbSchema, faqSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AuthorByline, AuthorBox } from "@/components/ui/AuthorBox";
import { NextSteps } from "@/components/layout/NextSteps";
import { SlotNextStep } from "@/components/ui/NextStep";

/**
 * The slot-studio comparison, at the address the old WordPress post ranked on
 * (position ~8 in Search Console, Nov 2026). It replaces that post's opinions
 * with figures: each studio's slot count, median published RTP and how many
 * of its titles come in several RTP versions (our slot catalogue), and where
 * it is licensed (each studio's own licence page, data/provider-licences.json).
 */
const PATH = "/top-crypto-slot-providers-compared";
const TITLE = "Top crypto slot providers compared: RTP, licences and best games";
const PUBLISHED = "2025-06-04";
const REWRITTEN = "2026-11-05";

/** The studios crypto casinos carry most, in the order we rank them (lib/top-studios first, then catalogue size). */
const ORDER = ["pragmatic-play", "hacksaw-gaming", "nolimit-city", "push-gaming", "play-n-go", "relax-gaming", "bgaming", "big-time-gaming", "netent", "elk-studios", "yggdrasil", "red-tiger"];

function rows() {
  return ORDER.flatMap((slug) => {
    const s = STUDIOS.find((x) => x.slug === slug);
    if (!s) return [];
    const all = querySlots({ studio: s.name });
    if (!all.total) return [];
    const multi = querySlots({ studio: s.name, versions: "1" }).total;
    const reviewed = siteData.slots.filter((x) => x.provider === s.name).sort((a, b) => a.name.localeCompare(b.name));
    return [{ s, total: all.total, median: all.medianRtp, multi, share: Math.round((multi / all.total) * 100), reviewed, href: studioHref(s.name) ?? `/providers/${s.slug}` }];
  });
}

export function generateMetadata() {
  const r = rows();
  return pageMetadata(
    TITLE,
    `${r.length} slot studios crypto casinos carry, compared on their own figures: how many slots each publishes, the median RTP, how many come in several RTP versions, and where each is licensed.`,
    PATH
  );
}

const CSS = `
.pv-wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
.pv-narrow { max-width: 760px; }
.pv-crumb { font-size: 13px; color: #6F7C84; margin-bottom: 24px; }
.pv-crumb a { color: #8E9CA4; }
.pv-h1 { margin: 0 0 16px; font-size: clamp(34px, 4.4vw, 50px); line-height: 1.06; letter-spacing: -.04em; font-weight: 700; color: #F7F9FA; text-wrap: balance; }
.pv-lead { margin: 0 0 22px; max-width: 62ch; font-size: 17.5px; line-height: 1.6; color: #98A6AE; }
.pv-answer { margin: 28px 0 0; padding: 20px 22px; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: #0D1114; box-shadow: inset 0 2px 0 #5FA8FF; }
.pv-answer b { display: block; margin-bottom: 6px; font-size: 15px; color: #F2F5F7; }
.pv-answer p { margin: 0; font-size: 15px; line-height: 1.65; color: #B7C4CB; }
.pv-sec { padding-top: 72px; }
.pv-h2 { margin: 0 0 8px; font-size: 26px; letter-spacing: -.025em; font-weight: 700; color: #F2F5F7; }
.pv-sub { margin: 0 0 20px; max-width: 70ch; font-size: 15px; line-height: 1.6; color: #8E9CA4; }
.pv-p { margin: 0 0 14px; font-size: 16px; line-height: 1.7; color: #C9D3D8; }
.pv-box { border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: #0D1114; overflow: hidden; }
.pv-row { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1.2fr) 90px 100px minmax(0, 1.1fr) 90px; gap: 14px; align-items: center; padding: 12px 18px; font-size: 14px; color: #DCE3E7; }
.pv-row + .pv-row { border-top: 1px solid rgba(255,255,255,.06); }
.pv-row.pv-head { font-size: 12px; color: #75828A; }
.pv-name { font-weight: 600; color: #F2F5F7; }
a.pv-name:hover { text-decoration: underline; text-underline-offset: 3px; }
.pv-cell small { display: none; }
.pv-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 14px; }
.pv-card { padding: 18px; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: #0D1114; }
.pv-card h3 { margin: 0 0 4px; font-size: 18px; font-weight: 700; color: #F2F5F7; }
.pv-card p { margin: 0 0 10px; font-size: 14px; line-height: 1.6; color: #AEBAC1; }
.pv-games { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
.pv-game { display: flex; align-items: center; gap: 8px; padding: 4px 10px 4px 4px; border: 1px solid rgba(255,255,255,.08); border-radius: 9px; font-size: 13px; color: #DCE3E7; }
.pv-game img, .pv-game i { display: block; width: 34px; height: 22px; border-radius: 5px; object-fit: cover; background: #11161A; }
.pv-faq details { padding: 16px 0; border-top: 1px solid rgba(255,255,255,.08); }
.pv-faq summary { cursor: pointer; font-size: 16px; font-weight: 600; color: #F2F5F7; }
.pv-faq p { margin: 10px 0 0; font-size: 15px; line-height: 1.65; color: #98A6AE; }
@media (max-width: 860px) {
  .pv-wrap { padding: 0 16px; }
  .pv-row { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 6px 14px; padding: 14px 16px; }
  .pv-row.pv-head { display: none; }
  .pv-name { grid-column: 1 / -1; }
  .pv-cell small { display: block; font-size: 11.5px; color: #75828A; }
  .pv-cards { grid-template-columns: 1fr; }
}
`;

export default function Page() {
  const r = rows();
  const t = catalogueTotals();
  const biggest = [...r].sort((a, b) => b.total - a.total)[0];
  const mostVersions = [...r].sort((a, b) => b.share - a.share)[0];
  const mostLicensed = [...r].sort((a, b) => b.s.licences.length - a.s.licences.length)[0];
  const updated = [REWRITTEN, catalogueAsOf].sort().pop()!;
  const fmt = (v: number | null) => (v === null ? "Not published" : `${v.toFixed(2)}%`);
  const faqs = [
    {
      q: "Which slot provider has the best RTP?",
      a: `By median published RTP across their slots in our catalogue, the highest here is ${[...r].filter((x) => x.median !== null).sort((a, b) => (b.median ?? 0) - (a.median ?? 0))[0]?.s.name} (${fmt([...r].filter((x) => x.median !== null).sort((a, b) => (b.median ?? 0) - (a.median ?? 0))[0]?.median ?? null)}). The median across all ${t.withRtp.toLocaleString()} slots with a figure is ${t.median}%.`,
    },
    {
      q: "Why do some studios publish several RTPs for one slot?",
      a: `So casinos can choose how much the game pays back. ${mostVersions?.s.name} publishes ${mostVersions?.multi} of its ${mostVersions?.total} slots in our catalogue in more than one RTP version. The version a casino runs is shown in the game's info screen.`,
    },
    {
      q: "Which slot provider holds the most licences?",
      a: `Of the studios compared here, ${mostLicensed?.s.name} lists the most: ${mostLicensed?.s.licences.length} licences or approvals on its own licence page. A studio's licences are separate from the casino's.`,
    },
  ];

  return (
    <main style={{ background: "#080B0D", color: "#E8EDF0", paddingBottom: 80 }}>
      <style>{CSS}</style>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Providers", path: "/providers" }, { name: "Slot providers compared", path: PATH }]),
          articleSchema(TITLE, "Slot studios compared on their own figures: slot count, median RTP, RTP versions and licences.", PATH, PUBLISHED, updated),
          itemListSchema("Slot providers compared", r.map((x) => ({ name: x.s.name, path: x.href }))),
          faqSchema(faqs),
        ]}
      />

      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)", background: "radial-gradient(60% 80% at 15% 0%, rgba(95,168,255,.06), transparent 70%), #0A0D10" }}>
        <div className="pv-wrap" style={{ padding: "30px 24px 44px" }}>
          <div className="pv-crumb">
            <Link href="/">Home</Link> / <Link href="/providers">Providers</Link> / <span style={{ color: "#AEBAC1" }}>Compared</span>
          </div>
          <h1 className="pv-h1">Top crypto slot providers compared</h1>
          <p className="pv-lead">The {r.length} studios crypto casinos carry most, compared on figures rather than opinions: how many slots each publishes, the median RTP, how often a game comes in several RTP versions, and where each studio is licensed.</p>
          <AuthorByline updated={updated} />
          <div className="pv-answer">
            <b>The short answer</b>
            <p>
              {biggest && mostVersions && biggest.s.slug === mostVersions.s.slug
                ? `${biggest.s.name} publishes the most slots here (${biggest.total}), and the most in several RTP versions (${mostVersions.multi}, or ${mostVersions.share}%), which is why the same game can pay back less at one casino than another.`
                : `${biggest?.s.name} publishes the most slots here (${biggest?.total}). ${mostVersions?.s.name} offers the most titles in several RTP versions (${mostVersions?.multi} of ${mostVersions?.total}, ${mostVersions?.share}%), which is why the same game can pay back less at one casino than another.`}{" "}
              {mostLicensed?.s.name} lists the most licences ({mostLicensed?.s.licences.length}).
            </p>
          </div>
        </div>
      </div>

      <div className="pv-wrap">
        <section className="pv-sec">
          <h2 className="pv-h2">The studios side by side</h2>
          <p className="pv-sub">Slot counts, median RTP and RTP versions from our catalogue of {t.slots.toLocaleString()} slots; licences and owners from each studio&apos;s own site.</p>
          <div className="pv-box">
            <div className="pv-row pv-head" data-keep-grid>
              <span>Studio</span><span>Owner</span><span>Slots</span><span>Median RTP</span><span>In several RTP versions</span><span>Licences</span>
            </div>
            {r.map((x) => (
              <div key={x.s.slug} className="pv-row" data-keep-grid>
                <Link href={x.href} className="pv-name">{x.s.name}</Link>
                <span className="pv-cell"><small>Owner</small>{x.s.parent ?? "Independent or not stated"}</span>
                <span className="pv-cell"><small>Slots</small>{x.total}</span>
                <span className="pv-cell"><small>Median RTP</small>{fmt(x.median)}</span>
                <span className="pv-cell"><small>In several RTP versions</small>{x.multi ? `${x.multi} (${x.share}%)` : "None listed"}</span>
                <span className="pv-cell"><small>Licences</small><a href={x.s.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#5FE3E8" }}>{x.s.licences.length} ↗</a></span>
              </div>
            ))}
          </div>
        </section>

        <section className="pv-sec">
          <h2 className="pv-h2">Each studio, and the games we&apos;ve reviewed</h2>
          <p className="pv-sub">Where each studio is licensed, from its own licence page, and its slots on our top list.</p>
          <div className="pv-cards">
            {r.map((x) => (
              <div key={x.s.slug} className="pv-card">
                <h3><Link href={x.href} style={{ color: "#F2F5F7" }}>{x.s.name}</Link></h3>
                <p>
                  {x.s.parent ? `Owned by ${x.s.parent}. ` : ""}
                  {x.s.founded ? `Founded ${x.s.founded}. ` : ""}
                  Licensed or approved in {x.s.licences.length} {x.s.licences.length === 1 ? "jurisdiction" : "jurisdictions"}
                  {x.s.licences.length ? `, including ${x.s.licences.slice(0, 4).map((l) => l.name).join(", ")}` : ""}.{" "}
                  <a href={x.s.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ fontSize: 12.5, color: "#5FE3E8" }}>Source ↗</a>
                </p>
                <p style={{ margin: 0 }}>{x.total} slots in our catalogue, median RTP {fmt(x.median)}{x.multi ? `, ${x.multi} with more than one published RTP version` : ""}.</p>
                {x.reviewed.length > 0 && (
                  <div className="pv-games">
                    {x.reviewed.slice(0, 6).map((g) => {
                      const art = slotArtBySlug(g.slug);
                      return (
                        <Link key={g.slug} href={`/slots/${g.slug}`} className="pv-game">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {art ? <img src={art} alt="" width={34} height={22} loading="lazy" decoding="async" /> : <i />}
                          {g.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="pv-sec pv-narrow">
          <h2 className="pv-h2">What to look for in a slot studio</h2>
          <p className="pv-p">A studio&apos;s median RTP tells you what its games return on their best version, but the version a casino runs matters more. Studios that publish several RTP versions let each casino choose, so check the figure in the game&apos;s info screen. Our <Link href="/rtp-watch" style={{ color: "#5FE3E8" }}>RTP Watch</Link> records which version casinos run.</p>
          <p className="pv-p">A studio&apos;s licences are separate from the casino&apos;s. They show which regulators have approved its games, which matters most if you play at a locally licensed site.</p>
        </section>

        <section className="pv-sec pv-narrow">
          <h2 className="pv-h2" style={{ marginBottom: 12 }}>Questions</h2>
          <div className="pv-faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <SlotNextStep name="a slot from these studios" />
          <div style={{ margin: "36px 0" }}>
            <AuthorBox />
          </div>
          <NextSteps
            steps={[
              { href: "/providers", label: "Every studio we track", hint: "Each studio's page, with its games and licences." },
              { href: "/the-best-crypto-slots-with-high-rtp-in-2026", label: "High-RTP slots", hint: "The slots that pay back the most, by published RTP." },
              { href: "/providers/licences", label: "Studio licence map", hint: "Where each studio is licensed." },
            ]}
          />
        </section>
      </div>
    </main>
  );
}
