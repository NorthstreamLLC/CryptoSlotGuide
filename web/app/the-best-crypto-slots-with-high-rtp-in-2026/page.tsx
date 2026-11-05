import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { querySlots, catalogueTotals, catalogueAsOf, volatilityOf } from "@/lib/slot-db";
import { cataloguePageSlugs, slotArtBySlug } from "@/lib/slot-page";
import { studioHref } from "@/lib/studio-pages";
import { pageMetadata } from "@/lib/seo";
import { articleSchema, breadcrumbSchema, faqSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AuthorByline, AuthorBox } from "@/components/ui/AuthorBox";
import { NextSteps } from "@/components/layout/NextSteps";
import { SlotNextStep } from "@/components/ui/NextStep";

/**
 * The high-RTP slots article, at the address the old WordPress post ranked on
 * (position ~9 in Search Console, Nov 2026). It replaces that post's unsourced
 * list with the studio-published RTPs from our slot catalogue, so the ranking
 * moves whenever the catalogue import does.
 */
const PATH = "/the-best-crypto-slots-with-high-rtp-in-2026";
const TITLE = "The best crypto slots with high RTP in 2026";
const PUBLISHED = "2026-07-16";
const REWRITTEN = "2026-11-05";
const VOL: Record<string, string> = { low: "Low", medium: "Medium", high: "High", "very-high": "Very high", extreme: "Extreme" };

/** Slugs with a page of their own on the site: our reviews plus the catalogue pages. */
const PAGE_SLUGS = new Set<string>([...siteData.slots.map((s) => s.slug), ...cataloguePageSlugs()]);

function data() {
  const t = catalogueTotals();
  // Highest studio-published RTP across the whole catalogue, released titles only.
  const top = querySlots({ sort: "rtp" }).rows.filter((g) => !g.upcoming && g.rtp !== null).slice(0, 25);
  // The slots players actually look for: our reviewed titles, by their published RTP.
  const known = siteData.slots
    .filter((s) => !s.unpublished?.includes("rtp") && s.rtp >= 96.5)
    .sort((a, b) => b.rtp - a.rtp || a.name.localeCompare(b.name))
    .slice(0, 12)
    .map((s) => ({ s, art: slotArtBySlug(s.slug) }));
  return { t, top, known };
}

export function generateMetadata() {
  const { t } = data();
  return pageMetadata(
    TITLE,
    `The highest-RTP slots among ${t.slots.toLocaleString()} we track, by the return each studio publishes, plus the popular titles that pay back most and how to check a casino isn't running a lower version.`,
    PATH
  );
}

const CSS = `
.hr-wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
.hr-narrow { max-width: 760px; }
.hr-crumb { font-size: 13px; color: #6F7C84; margin-bottom: 24px; }
.hr-crumb a { color: #8E9CA4; }
.hr-h1 { margin: 0 0 16px; font-size: clamp(34px, 4.4vw, 50px); line-height: 1.06; letter-spacing: -.04em; font-weight: 700; color: #F7F9FA; text-wrap: balance; }
.hr-lead { margin: 0 0 22px; max-width: 62ch; font-size: 17.5px; line-height: 1.6; color: #98A6AE; }
.hr-answer { margin: 28px 0 0; padding: 20px 22px; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: #0D1114; box-shadow: inset 0 2px 0 #FF7EB6; }
.hr-answer b { display: block; margin-bottom: 6px; font-size: 15px; color: #F2F5F7; }
.hr-answer p { margin: 0; font-size: 15px; line-height: 1.65; color: #B7C4CB; }
.hr-sec { padding-top: 72px; }
.hr-h2 { margin: 0 0 8px; font-size: 26px; letter-spacing: -.025em; font-weight: 700; color: #F2F5F7; }
.hr-sub { margin: 0 0 20px; max-width: 70ch; font-size: 15px; line-height: 1.6; color: #8E9CA4; }
.hr-p { margin: 0 0 14px; font-size: 16px; line-height: 1.7; color: #C9D3D8; }
.hr-cards { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.hr-card { display: block; min-width: 0; }
.hr-art { display: block; aspect-ratio: 16 / 10; border-radius: 12px; overflow: hidden; background: #11161A; border: 1px solid rgba(255,255,255,.06); }
.hr-art img { display: block; width: 100%; height: 100%; object-fit: cover; }
.hr-card b { display: block; margin-top: 10px; font-size: 15px; font-weight: 600; color: #EEF2F4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hr-card small { display: block; margin-top: 2px; font-size: 13px; color: #75828A; }
.hr-card em { font-style: normal; font-weight: 600; color: #57E39A; }
.hr-box { border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: #0D1114; overflow: hidden; }
.hr-row { display: grid; grid-template-columns: 34px minmax(0, 1.6fr) minmax(0, 1fr) 90px 100px; gap: 14px; align-items: center; padding: 11px 18px; font-size: 14px; color: #DCE3E7; }
.hr-row + .hr-row { border-top: 1px solid rgba(255,255,255,.06); }
.hr-row.hr-head { font-size: 12px; color: #75828A; }
.hr-rank { color: #5E6B73; font-weight: 600; font-variant-numeric: tabular-nums; }
.hr-name { min-width: 0; font-weight: 600; color: #F2F5F7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
a.hr-name:hover { text-decoration: underline; text-underline-offset: 3px; }
.hr-faq details { padding: 16px 0; border-top: 1px solid rgba(255,255,255,.08); }
.hr-faq summary { cursor: pointer; font-size: 16px; font-weight: 600; color: #F2F5F7; }
.hr-faq p { margin: 10px 0 0; font-size: 15px; line-height: 1.65; color: #98A6AE; }
@media (max-width: 960px) { .hr-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) {
  .hr-wrap { padding: 0 16px; }
  .hr-row { grid-template-columns: 26px minmax(0, 1fr) 70px; }
  .hr-row .hr-x { display: none; }
}
`;

export default function Page() {
  const { t, top, known } = data();
  const best = top[0];
  const studioLink = (name: string | null) => {
    const h = studioHref(name);
    return h ? <Link href={h} style={{ color: "#AEBAC1" }}>{name}</Link> : <>{name ?? "Unknown studio"}</>;
  };
  const faqs = [
    {
      q: "Which crypto slot has the highest RTP?",
      a: best
        ? `Of the ${t.slots.toLocaleString()} slots we track, the highest studio-published return is ${best.rtp}% (${best.name} by ${best.provider}). A high figure is the studio's best build; a casino can run a lower one.`
        : "We don't have a ranked figure to give right now.",
    },
    {
      q: "What is a good RTP for a slot?",
      a: `The median published RTP across the ${t.withRtp.toLocaleString()} slots with a figure is ${t.median}%. Anything above about 97% is in the top few percent; below 94% is low.`,
    },
    {
      q: "Can a casino change a slot's RTP?",
      a: `Not mid-game, but many studios publish the same slot in several RTP versions and the casino picks which one to run: ${t.multiVersion.toLocaleString()} of the slots we track have more than one published version. Open the game's info or paytable screen to see the figure for the version in front of you.`,
    },
    {
      q: "Does a higher RTP mean I'll win more?",
      a: "Only over a very large number of spins. RTP is the long-run average return; in a single session volatility matters far more, and a high-volatility slot can lose for a long time before a big win.",
    },
  ];

  return (
    <main style={{ background: "#080B0D", color: "#E8EDF0", paddingBottom: 80 }}>
      <style>{CSS}</style>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Slots", path: "/slots" }, { name: "High RTP slots", path: PATH }]),
          articleSchema(TITLE, "The highest-RTP slots by studio-published return, and how to check a casino runs the full version.", PATH, PUBLISHED, [REWRITTEN, catalogueAsOf].sort().pop()!),
          itemListSchema("Highest-RTP slots", known.map(({ s }) => ({ name: s.name, path: `/slots/${s.slug}` }))),
          faqSchema(faqs),
        ]}
      />

      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)", background: "radial-gradient(60% 80% at 15% 0%, rgba(255,126,182,.06), transparent 70%), #0A0D10" }}>
        <div className="hr-wrap" style={{ padding: "30px 24px 44px" }}>
          <div className="hr-crumb">
            <Link href="/">Home</Link> / <Link href="/slots">Slots</Link> / <span style={{ color: "#AEBAC1" }}>High RTP slots</span>
          </div>
          <h1 className="hr-h1">The best crypto slots with high RTP in 2026</h1>
          <p className="hr-lead">The slots that pay back the most, by the return each studio publishes, from the {t.slots.toLocaleString()} slots we track. Plus why the number in the lobby isn&apos;t always the one you get, and how to check.</p>
          <AuthorByline updated={[REWRITTEN, catalogueAsOf].sort().pop()} />
          <div className="hr-answer">
            <b>The short answer</b>
            <p>
              The median slot publishes a {t.median}% return. The popular slots with the highest published RTP are {known.slice(0, 3).map(({ s }) => `${s.name} (${s.rtp.toFixed(2)}%)`).join(", ")}. But {t.multiVersion.toLocaleString()} of the slots we track come in more than one RTP version, so check the figure in the game&apos;s info screen before you play.
            </p>
          </div>
        </div>
      </div>

      <div className="hr-wrap">
        <section className="hr-sec">
          <h2 className="hr-h2">Popular slots with the highest RTP</h2>
          <p className="hr-sub">The slots players look for most, ranked by the RTP the studio publishes. Each has a full review with its max win, volatility and RTP versions.</p>
          <div className="hr-cards">
            {known.map(({ s, art }) => (
              <Link key={s.slug} href={`/slots/${s.slug}`} className="hr-card">
                <span className="hr-art">
                  {art && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={art} alt={s.name} width={320} height={200} loading="lazy" decoding="async" />
                  )}
                </span>
                <b>{s.name}</b>
                <small>
                  {s.provider} · <em>{s.rtp.toFixed(2)}%</em> RTP
                </small>
              </Link>
            ))}
          </div>
        </section>

        <section className="hr-sec">
          <h2 className="hr-h2">The highest published RTPs across every slot we track</h2>
          <p className="hr-sub">The top 25 of {t.slots.toLocaleString()} slots by studio-published RTP, from our catalogue updated {new Date(catalogueAsOf + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}. Many are from smaller studios and won&apos;t be in every casino&apos;s lobby.</p>
          <div className="hr-box">
            <div className="hr-row hr-head" data-keep-grid>
              <span>#</span><span>Slot</span><span className="hr-x">Studio</span><span>RTP</span><span className="hr-x">Volatility</span>
            </div>
            {top.map((g, i) => (
              <div key={(g.slug ?? g.name) + i} className="hr-row" data-keep-grid>
                <span className="hr-rank">{i + 1}</span>
                {g.slug && PAGE_SLUGS.has(g.slug) ? <Link href={`/slots/${g.slug}`} className="hr-name">{g.name}</Link> : <span className="hr-name">{g.name}</span>}
                <span className="hr-x" style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{studioLink(g.provider)}</span>
                <span style={{ fontWeight: 600, color: "#57E39A" }}>{g.rtp}%</span>
                <span className="hr-x">{VOL[volatilityOf(g) ?? ""] ?? "Not published"}</span>
              </div>
            ))}
          </div>
          <p style={{ margin: "14px 0 0", fontSize: 14.5 }}>
            <Link href="/slots/database" style={{ fontWeight: 600, color: "#C9D3D8" }}>Search and sort all {t.slots.toLocaleString()} slots →</Link>
          </p>
        </section>

        <section className="hr-sec hr-narrow">
          <h2 className="hr-h2">Why the RTP you see isn&apos;t always the RTP you get</h2>
          <p className="hr-p">RTP (return to player) is the share of all money wagered that a slot pays back over a very long run. A 96% slot returns $96 for every $100 staked on average, across millions of spins, not in your session.</p>
          <p className="hr-p">Many studios publish the same game in several RTP versions, and the casino chooses which one to run. {t.multiVersion.toLocaleString()} of the {t.slots.toLocaleString()} slots we track have more than one published version. So a slot listed at 96.5% can be running at 94% or lower on a given site, with the same graphics and features.</p>
          <p className="hr-p">To check, open the game, then its info or paytable screen: the RTP of the version in front of you is printed there. Our <Link href="/rtp-watch" style={{ color: "#5FE3E8" }}>RTP Watch</Link> records which version casinos run, and the <Link href="/guides/how-casino-rtp-versions-work" style={{ color: "#5FE3E8" }}>RTP versions guide</Link> explains how to read the screen.</p>
        </section>

        <section className="hr-sec hr-narrow">
          <h2 className="hr-h2" style={{ marginBottom: 12 }}>Questions</h2>
          <div className="hr-faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <SlotNextStep name="a high-RTP slot" />
          <div style={{ margin: "36px 0" }}>
            <AuthorBox />
          </div>
          <NextSteps
            steps={[
              { href: "/slots", label: "Our top slots", hint: "The slots we rank, each with a full review." },
              { href: "/top-crypto-slot-providers-compared", label: "Slot studios compared", hint: "Which studios publish the most RTP versions." },
              { href: "/rtp-watch", label: "RTP Watch", hint: "Which RTP version each casino runs." },
            ]}
          />
        </section>
      </div>
    </main>
  );
}
