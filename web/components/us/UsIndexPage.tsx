import Link from "next/link";
import { rankedBrands, unmatchedListings, statesWithoutList } from "@/lib/us-brands";
import { NextSteps } from "@/components/layout/NextSteps";
import { GeoNotice } from "@/components/geo/GeoNotice";

const MONO = "var(--font-jetbrains-mono), monospace";

/**
 * The US-regulated index, for one product at a time.
 *
 * Casinos and sportsbooks are ranked separately because a combined ranking
 * answers neither question. Golden Nugget runs casino in three states and no
 * sportsbook anywhere; BetRivers leads the casino ranking on five states,
 * Delaware among them where nobody else does, and sits eighth on a combined
 * one. The same brand is a different proposition per product, so the pages
 * are too — and "best online casino in New Jersey" and "best sportsbook in
 * New Jersey" are different searches besides.
 */

export interface UsIndexCopy {
  kind: "casino" | "sportsbook";
  title: string;
  sub: string;
  path: string;
  /** The other product's page, so neither is a dead end. */
  sibling: { label: string; href: string; hint: string };
}

export function UsIndexPage({ copy }: { copy: UsIndexCopy }) {
  const { kind } = copy;
  const ranked = rankedBrands(kind);
  const other = kind === "casino" ? "sportsbook" : "casino";
  const unmatched = unmatchedListings().filter((u) => u.kind === kind);
  const noList = statesWithoutList(kind);
  const states = new Set(ranked.flatMap(({ counts }) => counts[kind]));
  const label = kind === "casino" ? "Casino states" : "Sports betting states";

  return (
    <main style={{ background: "#07090B", color: "#E8EDF0" }}>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(100% 100% at 20% 0%, rgba(0,194,204,.07), transparent 60%), #0B0F12" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "44px 40px 46px" }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 10 }}>
            Licensed in the United States
          </div>
          <h1 style={{ margin: "0 0 12px", fontSize: 42, lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 800, color: "#fff", textWrap: "balance" }}>
            {copy.title}
          </h1>
          <p style={{ margin: 0, maxWidth: "70ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE" }}>
            {copy.sub} {ranked.length} brands across {states.size} states, each state linked to the regulator&rsquo;s own published list. These are
            licensed US operators, not the offshore crypto casinos covered{" "}
            <Link href="/crypto-casinos" style={{ color: "#5FE3E8" }}>elsewhere on the site</Link> — different licences, different rules, and they only
            take you inside a state that allows it.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "26px 40px 0" }}>
        <GeoNotice context="regulated" />
      </section>

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "8px 40px 0" }}>
        <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,.08)", background: "linear-gradient(180deg,#0E1317,#0A0E11)", overflow: "hidden" }}>
          <div
            className="hidden md:grid md:grid-cols-[minmax(180px,2fr)_120px_minmax(240px,3fr)]"
            style={{ gap: 14, padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,.07)", fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#8E9CA5" }}
          >
            <span>Brand</span>
            <span>{label}</span>
            <span>Where</span>
          </div>
          {ranked.map(({ brand, counts }, i) => (
            <div
              key={brand.slug}
              className="grid grid-cols-2 md:grid-cols-[minmax(180px,2fr)_120px_minmax(240px,3fr)]"
              style={{ gap: 14, padding: "14px 20px", alignItems: "center", borderTop: i ? "1px solid rgba(255,255,255,.05)" : undefined }}
            >
              <Link href={`/us-casinos/${brand.slug}`} className="col-span-2 md:col-span-1" style={{ fontSize: 15.5, fontWeight: 800, color: "#fff" }}>
                {brand.name}
              </Link>
              <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: kind === "casino" ? "#7BE0B8" : "#5FE3E8" }}>
                {counts[kind].length}
              </span>
              <span className="col-span-2 md:col-span-1" style={{ fontFamily: MONO, fontSize: 11.5, color: "#8DA0AA", overflowWrap: "anywhere" }}>
                {counts[kind].join(" · ")}
                {counts[other].length > 0 && (
                  <span style={{ color: "#5F6B72" }}> · also {counts[other].length} {other === "casino" ? "casino" : "sports"} states</span>
                )}
              </span>
            </div>
          ))}
        </div>

        <p style={{ margin: "14px 0 0", maxWidth: "76ch", fontSize: 13, lineHeight: 1.6, color: "#77858E" }}>
          Counts are states whose regulator names the brand on its own published list, not states it is live in — a few lists lag a rebrand, and each
          brand page says so where it applies.
          {noList.length > 0 && (
            <>
              {" "}
              {noList.map((s) => s.name).join(", ")} {noList.length === 1 ? "permits it and publishes" : "permit it and publish"} no operator list at all,
              so nobody can appear there however widely they operate — in Rhode Island the lottery is both the regulator and the operator. Treat every
              number as a floor.
            </>
          )}
          {unmatched.length > 0 && (
            <>
              {" "}
              A further {unmatched.length} listings are venue names, licence-holding companies or B2B platform suppliers rather than brands you can sign
              up to; they stay on their <Link href="/legal/us" style={{ color: "#5FE3E8" }}>state pages</Link> rather than being guessed into a brand.
            </>
          )}
        </p>
      </section>

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}>
        <NextSteps
          steps={[
            copy.sibling,
            { label: "State-by-state gambling law", href: "/legal/us", hint: "What is legal where, and the bills that would change it." },
            { label: "US sweepstakes casinos", href: "/sweepstakes-casinos", hint: "The model that runs in states with no licensed online casino." },
          ]}
        />
      </section>
    </main>
  );
}
