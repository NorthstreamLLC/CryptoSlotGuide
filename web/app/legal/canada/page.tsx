import Link from "next/link";
import { LegalMap } from "@/components/legal/LegalMap";
import { NextSteps } from "@/components/layout/NextSteps";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/lib/schema";
import {
  CA_FEDERAL,
  CA_PROVINCES,
  CA_SHAPES,
  CA_VIEWBOX,
  blockedCounts,
  modelOf,
  operatorsBlocking,
} from "@/lib/legal-canada";

const MONO = "var(--font-jetbrains-mono), monospace";
const TITLE = "Online casinos in Canada, province by province";
const SUB =
  "Canada has no national answer. The Criminal Code lets each province run or license its own online gambling, and seven of the casinos we track name a Canadian province in their own terms as one they will not serve.";

export const metadata = pageMetadata(TITLE, SUB, "/legal/canada");

/**
 * Colours set here rather than through toneOf(), which keyword-matches: it
 * reads "no provincial online casino" as legal because the string contains
 * "online". A map is the one place a wrong colour is read as fact.
 */
const MODEL_FILL: Record<string, string> = {
  "licensed private market": "#2FB67A",
  "provincial monopoly": "#2FA8B0",
  "no provincial online casino": "#3A4A52",
};
const LEGEND = [
  { color: "#2FB67A", label: "Licenses private operators" },
  { color: "#2FA8B0", label: "Province runs the only legal site" },
  { color: "#3A4A52", label: "No provincial online casino" },
];

export default function Page() {
  const counts = blockedCounts();
  const blocked = counts.filter((c) => c.n > 0);
  const sourced = CA_PROVINCES.filter((p) => p.sourced);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Gambling law", path: "/legal" },
            { name: "Canada", path: "/legal/canada" },
          ]),
          collectionPageSchema(TITLE, SUB, "/legal/canada"),
          itemListSchema(TITLE, CA_PROVINCES.map((p) => ({ name: p.name, path: "/legal/canada" }))),
        ]}
      />
      <main style={{ background: "#07090B", color: "#E8EDF0" }}>
        <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(100% 100% at 20% 0%, rgba(0,194,204,.07), transparent 60%), #0B0F12" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 40px 44px" }}>
            <nav style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 18 }}>
              <Link href="/legal" style={{ color: "#83919A" }}>Gambling law</Link>
              <span style={{ margin: "0 8px" }}>/</span>
              <span>Canada</span>
            </nav>
            <h1 style={{ margin: "0 0 12px", fontSize: 42, lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 800, color: "#fff", textWrap: "balance" }}>
              {TITLE}
            </h1>
            <p style={{ margin: 0, maxWidth: "70ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE" }}>{CA_FEDERAL.summary}</p>
            <div style={{ marginTop: 10, display: "flex", gap: 14, flexWrap: "wrap" }}>
              {CA_FEDERAL.sources.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>
                  {s.label} ↗
                </a>
              ))}
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "30px 40px 0" }}>
          <LegalMap
            shapes={CA_SHAPES}
            viewBox={CA_VIEWBOX}
            labels
            statusOf={(c) => modelOf(c)}
            fillOf={(c) => MODEL_FILL[modelOf(c) ?? ""]}
            hrefOf={() => null}
            legend={LEGEND}
          />
        </section>

        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "34px 40px 0" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, letterSpacing: "-.025em", color: "#fff" }}>Who will not take you</h2>
          <p style={{ margin: "0 0 16px", maxWidth: "72ch", fontSize: 14.5, lineHeight: 1.6, color: "#8DA0AA" }}>
            Straight from each casino&rsquo;s own restricted-regions page or terms. This is the part that decides whether you can actually sign up, and it
            does not track the law — an operator may refuse a province that licenses gambling, usually because it has not registered there.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            {blocked.map((b) => (
              <div key={b.code} style={{ padding: "16px 18px", borderRadius: 14, background: "#0E1316", border: "1px solid rgba(255,255,255,.07)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 16.5, fontWeight: 800, color: "#fff" }}>{b.name}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: "#C4653A" }}>{b.n} refuse</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {operatorsBlocking(b.code).map((o) => (
                    <a
                      key={o.slug}
                      href={o.sourceUrl ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      style={{ padding: "4px 9px", borderRadius: 100, background: "rgba(196,101,58,.1)", border: "1px solid rgba(196,101,58,.28)", fontSize: 12, color: "#E0A98C" }}
                    >
                      {o.name} ↗
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ margin: "14px 0 0", maxWidth: "72ch", fontSize: 13, lineHeight: 1.6, color: "#77858E" }}>
            The other {counts.length - blocked.length} provinces and territories are named by none of the casinos we track. That means their terms do not
            single the province out — not that any given operator is registered there.
          </p>
        </section>

        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "34px 40px 0" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 26, fontWeight: 800, letterSpacing: "-.025em", color: "#fff" }}>How each province runs it</h2>
          <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,.08)", background: "#0C1013", overflow: "hidden" }}>
            {CA_PROVINCES.map((p, i) => (
              <div
                key={p.code}
                className="grid grid-cols-1 md:grid-cols-[minmax(150px,1fr)_minmax(150px,1fr)_minmax(220px,2fr)]"
                style={{ gap: 12, padding: "13px 18px", alignItems: "baseline", borderTop: i ? "1px solid rgba(255,255,255,.05)" : undefined }}
              >
                <span style={{ fontSize: 15, fontWeight: 700, color: "#E8EDF0" }}>{p.name}</span>
                <span style={{ fontFamily: MONO, fontSize: 11.5, color: MODEL_FILL[p.model] ?? "#8DA0AA" }}>{p.model}</span>
                <span style={{ fontSize: 13, lineHeight: 1.55, color: p.sourced ? "#8DA0AA" : "#5F6B72" }}>
                  {p.summary ?? "Provincial detail not yet read from this province's own regulator — the model above follows from the Criminal Code, the specifics do not."}
                  {p.regulator?.url && (
                    <>
                      {" "}
                      <a href={p.regulator.url} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8", whiteSpace: "nowrap" }}>
                        {p.regulator.name.split(" ")[0]} ↗
                      </a>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
          <p style={{ margin: "12px 0 0", fontFamily: MONO, fontSize: 11, color: "#77858E" }}>
            {sourced.length} of {CA_PROVINCES.length} provinces sourced to their own regulator so far.
          </p>
        </section>

        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}>
          <NextSteps
            steps={[
              { label: "Gambling law worldwide", href: "/legal", hint: "The same question for 174 countries, on one map." },
              { label: "US state by state", href: "/legal/us", hint: "The other federal country where the answer changes at the border." },
              { label: "Crypto casinos", href: "/crypto-casinos", hint: "Every operator we track, with its own restricted list linked." },
            ]}
          />
        </section>
      </main>
    </>
  );
}
