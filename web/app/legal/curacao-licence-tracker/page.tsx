import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { getSpecFact } from "@/lib/spec-sheet";
import { brandFor } from "@/lib/casino-facts";
import { reviewPath } from "@/lib/outbound";
import { hasFactArticle } from "@/lib/fact-articles";
import { CGA_REGISTER } from "@/lib/curacao-register";
import { pageMetadata } from "@/lib/seo";
import { storyCardFor } from "@/lib/og";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandMark } from "@/components/ui/BrandMark";
import { AuthorByline, AuthorBox } from "@/components/ui/AuthorBox";
import { NextSteps } from "@/components/layout/NextSteps";

/**
 * Where each crypto casino we cover stands on the Curaçao Gaming Authority's
 * own licence register. A link asset for press: one page, only the data. Rows
 * come from each casino's "Compliance / Register check" fact (the monthly
 * re-check updates them); register-wide counts from lib/curacao-register.ts.
 */
const PATH = "/legal/curacao-licence-tracker";
const TITLE = "Curaçao licence tracker: where each crypto casino stands";
const PUBLISHED = "2026-11-06";

const fmtDate = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

type Row = { slug: string; name: string; mono: string; holder: string | null; licence: string | null; expiry: string; status: string; tone: "watch" | "ok" | "bad" | "missing"; source: string; asOf?: string };

/** Pull the register fields out of a Register check fact's wording. */
function parse(value: string): Omit<Row, "slug" | "name" | "mono" | "source" | "asOf"> {
  if (/not (found )?on the Cura/i.test(value) || /^Not found/i.test(value)) {
    return { holder: value.match(/^(.+?), the operator/)?.[1] ?? null, licence: null, expiry: "—", status: "Not on the register", tone: "missing" };
  }
  const holder = value.match(/^(.+?) is on the/)?.[1] ?? null;
  const licence = value.match(/(?:OGL|CGA)\/\d{4}\/\d+\/\d+/)?.[0] ?? null;
  const expiry = /no expiry/i.test(value) ? "None" : value.match(/expiry (?:of )?(\d{1,2} \w{3} \d{4})/)?.[1] ?? "—";
  const status = (value.match(/status (?:reads )?"?([^"(]+?)"?(?:,| \()/)?.[1] ?? "See register").trim().replace(/\.$/, "");
  const tone = /assessment/i.test(status) ? "watch" : /indefinite/i.test(status) ? "ok" : /expired|revoked/i.test(status) ? "bad" : "watch";
  return { holder, licence, expiry, status, tone };
}

function rows(): Row[] {
  return siteData.ops
    .flatMap((o) => {
      const f = getSpecFact(o.slug, "Compliance", "Register check");
      if (!f?.value || !/Cura/i.test(f.value)) return [];
      return [{ slug: o.slug, name: o.name, mono: o.mono, ...parse(f.value), source: f.sourceUrl ?? CGA_REGISTER.url, asOf: f.asOf }];
    })
    .sort((a, b) => {
      const order = { bad: 0, watch: 1, missing: 2, ok: 3 } as const;
      return order[a.tone] - order[b.tone] || a.name.localeCompare(b.name);
    });
}

export function generateMetadata() {
  const assess = CGA_REGISTER.counts.find((c) => c.key === "assess")!.n;
  return pageMetadata(
    TITLE,
    `On the Curaçao Gaming Authority's register dated ${fmtDate(CGA_REGISTER.date)}, ${assess} of ${CGA_REGISTER.total} online gaming licence entries read "Assessment in progress". Where Stake, Roobet, Rollbit, Shuffle and ${rows().length - 4} other crypto casinos stand, from the register itself.`,
    PATH,
    storyCardFor({ kind: "register" }, TITLE, PATH)
  );
}

const TONE = {
  watch: { c: "#FFC531", bg: "rgba(255,197,49,.12)" },
  ok: { c: "#57E39A", bg: "rgba(87,227,154,.12)" },
  bad: { c: "#FF7E7E", bg: "rgba(255,126,126,.12)" },
  plain: { c: "#AEBAC1", bg: "rgba(255,255,255,.06)" },
  missing: { c: "#AEBAC1", bg: "rgba(255,255,255,.06)" },
} as const;

const CSS = `
.ct-wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
.ct-narrow { max-width: 760px; }
.ct-crumb { font-size: 13px; color: #6F7C84; margin-bottom: 24px; }
.ct-crumb a { color: #8E9CA4; }
.ct-h1 { margin: 0 0 16px; font-size: clamp(34px, 4.4vw, 50px); line-height: 1.06; letter-spacing: -.04em; font-weight: 700; color: #F7F9FA; text-wrap: balance; }
.ct-lead { margin: 0 0 22px; max-width: 64ch; font-size: 17.5px; line-height: 1.6; color: #98A6AE; }
.ct-answer { margin: 28px 0 0; padding: 20px 22px; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: #0D1114; box-shadow: inset 0 2px 0 #FFC531; }
.ct-answer b { display: block; margin-bottom: 6px; font-size: 15px; color: #F2F5F7; }
.ct-answer p { margin: 0; font-size: 15px; line-height: 1.65; color: #B7C4CB; }
.ct-sec { padding-top: 64px; }
.ct-h2 { margin: 0 0 8px; font-size: 26px; letter-spacing: -.025em; font-weight: 700; color: #F2F5F7; }
.ct-sub { margin: 0 0 20px; max-width: 72ch; font-size: 15px; line-height: 1.6; color: #8E9CA4; }
.ct-p { margin: 0 0 14px; font-size: 16px; line-height: 1.7; color: #C9D3D8; }
.ct-bars { display: flex; flex-direction: column; gap: 10px; padding: 20px; border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: #0D1114; }
.ct-bar { display: grid; grid-template-columns: minmax(0, 260px) minmax(0, 1fr) 90px; gap: 14px; align-items: center; font-size: 14px; color: #DCE3E7; }
.ct-track { height: 12px; border-radius: 6px; background: rgba(255,255,255,.05); overflow: hidden; }
.ct-fill { height: 100%; border-radius: 6px; }
.ct-n { text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }
.ct-box { border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: #0D1114; overflow: hidden; }
.ct-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1fr) 110px minmax(0, 1.3fr) 70px; gap: 14px; align-items: center; padding: 12px 18px; font-size: 14px; color: #DCE3E7; }
.ct-row + .ct-row { border-top: 1px solid rgba(255,255,255,.06); }
.ct-row.ct-head { font-size: 12px; color: #75828A; }
.ct-name { display: flex; align-items: center; gap: 10px; min-width: 0; font-weight: 600; color: #F2F5F7; }
.ct-name:hover { text-decoration: underline; text-underline-offset: 3px; }
.ct-chip { display: inline-block; padding: 3px 9px; border-radius: 6px; font-size: 12.5px; font-weight: 600; line-height: 1.35; }
.ct-cell small { display: none; }
.ct-src { font-size: 12px; color: #5FE3E8; }
.ct-faq details { padding: 16px 0; border-top: 1px solid rgba(255,255,255,.08); }
.ct-faq summary { cursor: pointer; font-size: 16px; font-weight: 600; color: #F2F5F7; }
.ct-faq p { margin: 10px 0 0; font-size: 15px; line-height: 1.65; color: #98A6AE; }
@media (max-width: 900px) {
  .ct-wrap { padding: 0 16px; }
  .ct-bar { grid-template-columns: minmax(0, 1fr) 70px; }
  .ct-bar .ct-track { grid-column: 1 / -1; grid-row: 2; }
  .ct-row { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 6px 14px; padding: 14px 16px; }
  .ct-row.ct-head { display: none; }
  .ct-name { grid-column: 1 / -1; }
  .ct-cell small { display: block; font-size: 11.5px; color: #75828A; }
}
`;

export default function Page() {
  const r = rows();
  const reg = CGA_REGISTER;
  const assess = reg.counts.find((c) => c.key === "assess")!.n;
  const indef = reg.counts.find((c) => c.key === "indef")!.n;
  const pct = Math.round((assess / reg.total) * 100);
  const prev = reg.history.length > 1 ? reg.history[reg.history.length - 2] : null;
  const ours = { watch: r.filter((x) => x.tone === "watch").length, ok: r.filter((x) => x.tone === "ok").length, bad: r.filter((x) => x.tone === "bad").length, missing: r.filter((x) => x.tone === "missing").length };
  const named = (tone: Row["tone"]) => r.filter((x) => x.tone === tone).map((x) => x.name);
  const max = Math.max(...reg.counts.map((c) => c.n));
  const faqs = [
    {
      q: "What does \"Assessment in progress\" mean on the Curaçao register?",
      a: `The register doesn't define it. It appears on ${assess} of ${reg.total} entries on the register dated ${fmtDate(reg.date)}, often next to an expiry date that has already passed. It does not by itself mean a licence has been withdrawn; only the Curaçao Gaming Authority can say what stage each assessment is at.`,
    },
    {
      q: "Is Stake licensed in Curaçao?",
      a: (() => {
        const s = r.find((x) => x.slug === "stake");
        return s ? `Stake's operator, ${s.holder}, holds licence ${s.licence} on the register dated ${fmtDate(reg.date)}. Its listed expiry is ${s.expiry} and its status reads "${s.status}".` : "Stake isn't in our tracker right now.";
      })(),
    },
    {
      q: "Which crypto casinos have an indefinite Curaçao licence?",
      a: `Of the casinos we track, ${named("ok").join(", ")} are listed as "Indefinite", with no expiry date.`,
    },
    {
      q: "How often is this updated?",
      a: "Every month, when we re-check each casino against the newest register the Curaçao Gaming Authority publishes. Each row links to the register it was checked against.",
    },
  ];

  return (
    <main style={{ background: "#080B0D", color: "#E8EDF0", paddingBottom: 80 }}>
      <style>{CSS}</style>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Gambling laws", path: "/legal" }, { name: "Curaçao licence tracker", path: PATH }]),
          articleSchema(TITLE, `Where each crypto casino stands on the Curaçao Gaming Authority's licence register dated ${fmtDate(reg.date)}.`, PATH, PUBLISHED, [PUBLISHED, ...r.map((x) => x.asOf ?? "")].sort().pop()!),
          faqSchema(faqs),
        ]}
      />

      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)", background: "radial-gradient(60% 80% at 15% 0%, rgba(255,197,49,.05), transparent 70%), #0A0D10" }}>
        <div className="ct-wrap" style={{ padding: "30px 24px 44px" }}>
          <div className="ct-crumb">
            <Link href="/">Home</Link> / <Link href="/legal">Gambling laws</Link> / <span style={{ color: "#AEBAC1" }}>Curaçao licence tracker</span>
          </div>
          <h1 className="ct-h1">Curaçao licence tracker: where each crypto casino stands</h1>
          <p className="ct-lead">
            Most crypto casinos say they&apos;re licensed in Curaçao. This page checks each one against the Curaçao Gaming Authority&apos;s own licence register, published as a PDF, and is updated every month.
          </p>
          <AuthorByline updated={[PUBLISHED, ...r.map((x) => x.asOf ?? "")].sort().pop()} />
          <div className="ct-answer">
            <b>On the register dated {fmtDate(reg.date)}</b>
            <p>
              {assess} of the {reg.total} online gaming licence entries ({pct}%) read &quot;Assessment in progress&quot;{prev ? `, ${prev.assess > assess ? "down from" : prev.assess < assess ? "up from" : "the same as"} ${prev.assess} on the ${fmtDate(prev.date)} register` : ""}, and {indef} read &quot;Indefinite&quot;. Of the {r.length} crypto casinos we track there, {ours.watch} are under assessment, {ours.ok} are indefinite, {ours.bad} {ours.bad === 1 ? "is" : "are"} listed as expired or revoked and {ours.missing} {ours.missing === 1 ? "isn't" : "aren't"} on the register at all.{" "}
              <a href={reg.url} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#5FE3E8" }}>Read the register (PDF) ↗</a>
            </p>
          </div>
        </div>
      </div>

      <div className="ct-wrap">
        <section className="ct-sec">
          <h2 className="ct-h2">The casinos we track</h2>
          <p className="ct-sub">Each row is the casino&apos;s operator as it appears on the register, matched by the company name or number the casino gives on its own site. Expired or revoked first, then those under assessment.</p>
          <div className="ct-box">
            <div className="ct-row ct-head" data-keep-grid>
              <span>Casino</span><span>Licence holder</span><span>Licence</span><span>Listed expiry</span><span>Register status</span><span>Source</span>
            </div>
            {r.map((x) => (
              <div key={x.slug} className="ct-row" data-keep-grid>
                <Link href={hasFactArticle(x.slug) ? `/casinos/${x.slug}/facts` : reviewPath(x.slug)} className="ct-name">
                  <span style={{ width: 28, height: 28, flex: "none", borderRadius: 7, overflow: "hidden" }}>
                    <BrandMark slug={x.slug} mono={x.mono} tint={brandFor(x.slug)} radius={7} fontSize={9} />
                  </span>
                  <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.name}</span>
                </Link>
                <span className="ct-cell"><small>Licence holder</small>{x.holder ?? "—"}</span>
                <span className="ct-cell" style={{ fontVariantNumeric: "tabular-nums" }}><small>Licence</small>{x.licence ?? "—"}</span>
                <span className="ct-cell"><small>Listed expiry</small>{x.expiry}</span>
                <span className="ct-cell"><small>Register status</small><span className="ct-chip" style={{ color: TONE[x.tone].c, background: TONE[x.tone].bg }}>{x.status}</span></span>
                <a href={x.source} target="_blank" rel="noopener noreferrer nofollow" className="ct-src">PDF ↗</a>
              </div>
            ))}
          </div>
        </section>

        <section className="ct-sec">
          <h2 className="ct-h2">The whole register, by status</h2>
          <p className="ct-sub">
            All {reg.total} entries on the register dated {fmtDate(reg.date)}, B2C and B2B, counted by the status the register gives each one.
            {reg.unique < reg.total ? ` They cover ${reg.unique} licence numbers: ${reg.total - reg.unique === 1 ? "one is" : `${reg.total - reg.unique} are`} listed twice with different statuses, and counted under each.` : ""}
          </p>
          <div className="ct-bars">
            {reg.counts.map((c) => (
              <div key={c.key} className="ct-bar" data-keep-grid>
                <span>{c.label}</span>
                <span className="ct-track"><span className="ct-fill" style={{ display: "block", width: `${(c.n / max) * 100}%`, background: TONE[c.tone].c }} /></span>
                <span className="ct-n">{c.n} <span style={{ color: "#75828A", fontWeight: 400 }}>({Math.round((c.n / reg.total) * 100)}%)</span></span>
              </div>
            ))}
          </div>
        </section>

        <section className="ct-sec ct-narrow">
          <h2 className="ct-h2">How to read it, and check it yourself</h2>
          <p className="ct-p">Under Curaçao&apos;s new online gaming policy (the register dates it from 15 November 2023), operators hold licences issued directly by the Curaçao Gaming Authority rather than sublicences under a master licence. The register lists each of those licences with its number, holder, company registration number, issue date, expiry date and status.</p>
          <p className="ct-p">The register doesn&apos;t explain its statuses. &quot;Assessment in progress&quot; often sits next to an expiry date that has passed. It is the register&apos;s wording, not a finding against the casino. Ask the Curaçao Gaming Authority if you need to know where a specific assessment stands.</p>
          <p className="ct-p">To check a casino yourself: find the company number in its footer or terms, open the <a href={reg.registerPage} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#5FE3E8" }}>register page on cga.cw</a>, download the newest PDF and search it for that number.</p>
        </section>

        <section className="ct-sec ct-narrow">
          <h2 className="ct-h2" style={{ marginBottom: 12 }}>Questions</h2>
          <div className="ct-faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <p style={{ margin: "28px 0 0", fontSize: 14, lineHeight: 1.6, color: "#8E9CA4" }}>
            Using these figures? Cite and link this page; it&apos;s updated monthly. Corrections go to our <Link href="/corrections" style={{ color: "#C9D3D8" }}>corrections log</Link>.
          </p>
          <div style={{ margin: "36px 0" }}>
            <AuthorBox />
          </div>
          <NextSteps
            steps={[
              { href: "/news", label: "What changed this month", hint: "Licence, offer and fee changes at each casino, sourced." },
              { href: "/casinos/facts", label: "Facts about each casino", hint: "Who runs it and what its licence says." },
              { href: "/legal", label: "Is it legal where you live?", hint: "Online gambling law by country and US state." },
            ]}
          />
        </section>
      </div>
    </main>
  );
}
