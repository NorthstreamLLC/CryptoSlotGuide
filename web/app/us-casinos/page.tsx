import Link from "next/link";
import { rankedBrands, unmatchedListings, statesWithoutList } from "@/lib/us-brands";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps } from "@/components/layout/NextSteps";

const MONO = "var(--font-jetbrains-mono), monospace";
const TITLE = "US-regulated casinos and sportsbooks";
const SUB =
  "Which state regulators license which brand, for sports betting and for online casino, read off each regulator's own published list.";

export const metadata = pageMetadata(TITLE, SUB, "/us-casinos");

export default function Page() {
  const ranked = rankedBrands();
  const unmatched = unmatchedListings();
  const states = new Set(ranked.flatMap(({ counts }) => [...counts.sportsbook, ...counts.casino]));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "US regulated", path: "/us-casinos" }]),
          collectionPageSchema(TITLE, SUB, "/us-casinos"),
          itemListSchema(TITLE, ranked.map(({ brand }) => ({ name: brand.name, path: `/us-casinos/${brand.slug}` }))),
        ]}
      />
      <main style={{ background: "#07090B", color: "#E8EDF0" }}>
        <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(100% 100% at 20% 0%, rgba(0,194,204,.07), transparent 60%), #0B0F12" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "44px 40px 46px" }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 10 }}>
              Licensed in the United States
            </div>
            <h1 style={{ margin: "0 0 12px", fontSize: 42, lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 800, color: "#fff", textWrap: "balance" }}>
              {TITLE}
            </h1>
            <p style={{ margin: 0, maxWidth: "70ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE" }}>
              {SUB} {ranked.length} brands across {states.size} states. These are regulated US operators, not the offshore crypto casinos covered{" "}
              <Link href="/crypto-casinos" style={{ color: "#5FE3E8" }}>elsewhere on the site</Link> — different licences, different rules, and they only
              take you if you are physically in a state that allows it.
            </p>
          </div>
        </section>

        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "34px 40px 0" }}>
          <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,.08)", background: "linear-gradient(180deg,#0E1317,#0A0E11)", overflow: "hidden" }}>
            <div
              className="hidden md:grid md:grid-cols-[minmax(180px,2fr)_120px_120px_minmax(200px,2fr)]"
              style={{ gap: 14, padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,.07)", fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#8E9CA5" }}
            >
              <span>Brand</span><span>Sports</span><span>Casino</span><span>Casino states</span>
            </div>
            {ranked.map(({ brand, counts }, i) => (
              <div
                key={brand.slug}
                className="grid grid-cols-2 md:grid-cols-[minmax(180px,2fr)_120px_120px_minmax(200px,2fr)]"
                style={{ gap: 14, padding: "14px 20px", alignItems: "center", borderTop: i ? "1px solid rgba(255,255,255,.05)" : undefined }}
              >
                <Link href={`/us-casinos/${brand.slug}`} className="col-span-2 md:col-span-1" style={{ fontSize: 15.5, fontWeight: 800, color: "#fff" }}>
                  {brand.name}
                </Link>
                <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: counts.sportsbook.length ? "#5FE3E8" : "#77858E" }}>
                  {counts.sportsbook.length || "—"}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: counts.casino.length ? "#7BE0B8" : "#77858E" }}>
                  {counts.casino.length || "—"}
                </span>
                <span className="col-span-2 md:col-span-1" style={{ fontFamily: MONO, fontSize: 11.5, color: "#8DA0AA", overflowWrap: "anywhere" }}>
                  {counts.casino.join(" · ") || "—"}
                </span>
              </div>
            ))}
          </div>
          <p style={{ margin: "14px 0 0", maxWidth: "76ch", fontSize: 13, lineHeight: 1.6, color: "#77858E" }}>
            Counts are states whose regulator names the brand on its own published list, not states it is live in — a few lists lag a rebrand, and each
            brand page says so where it applies. {unmatched.length} further listings are venue names, licence-holding companies or B2B platform suppliers
            rather than brands you can sign up to; they stay on their{" "}
            <Link href="/legal/us" style={{ color: "#5FE3E8" }}>state pages</Link> rather than being guessed into a brand here.
          </p>
          <p style={{ margin: "10px 0 0", maxWidth: "76ch", fontSize: 13, lineHeight: 1.6, color: "#77858E" }}>
            Five states are missing from every count above, because no list exists to read:{" "}
            {[...statesWithoutList("sportsbook"), ...statesWithoutList("casino")].map((s) => s.name).join(", ")}. Each permits the product but publishes no
            licensed-operator list — in Rhode Island the lottery is the regulator and the operator. Treat every number here as a floor.
          </p>
        </section>

        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}>
          <NextSteps
            steps={[
              { label: "State-by-state gambling law", href: "/legal/us", hint: "What is legal where, and the bills that would change it." },
              { label: "US sweepstakes casinos", href: "/sweepstakes-casinos", hint: "The model that operates in states with no licensed online casino." },
              { label: "Crypto casinos", href: "/crypto-casinos", hint: "Offshore operators taking crypto, compared on their own terms." },
            ]}
          />
        </section>
      </main>
    </>
  );
}
