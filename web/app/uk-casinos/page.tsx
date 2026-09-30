import Link from "next/link";
import ukLicences from "@/data/uk-licences.json";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps } from "@/components/layout/NextSteps";
import { casinosForCountry } from "@/lib/landing";

/**
 * UK-licensed casinos, verified against the Gambling Commission's register.
 *
 * This page exists because of a number on the crypto side: one of the 46
 * crypto casinos we track accepts a UK visitor, and 39 refuse by name. Until
 * now a British reader was told that and sent nowhere.
 *
 * What it publishes is narrow on purpose. Every row is the licence holder,
 * its account number and the register's own detail page — nothing about
 * bonuses, payout times or wagering, because we have not sourced those. The
 * six names came from a prototype file whose every value was unsourced; the
 * names survived that cull and the values did not.
 */

const MONO = "var(--font-jetbrains-mono), monospace";
const TITLE = "UK-licensed online casinos";
const SUB =
  "Checked against the Gambling Commission's public register: who holds the licence, its account number, and the register entry for each.";

interface Licence {
  entity: string;
  accountNumber: string;
  detailUrl: string;
  domains: string[];
}
const DB = ukLicences as { read: string; source: string; brands: Record<string, { name: string; licences: Licence[] }> };
const BRANDS = Object.entries(DB.brands);

export const metadata = pageMetadata(TITLE, SUB, "/uk-casinos");

export default function Page() {
  const uk = casinosForCountry("GB");

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "UK-licensed casinos", path: "/uk-casinos" }]),
          collectionPageSchema(TITLE, SUB, "/uk-casinos"),
          itemListSchema(TITLE, BRANDS.map(([slug, b]) => ({ name: b.name, path: `/uk-casinos#${slug}` }))),
        ]}
      />
      <main style={{ background: "#07090B", color: "#E8EDF0" }}>
        <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(100% 100% at 20% 0%, rgba(0,194,204,.07), transparent 60%), #0B0F12" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 40px 46px" }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 10 }}>
              Licensed in Great Britain
            </div>
            <h1 style={{ margin: "0 0 12px", fontSize: 42, lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 800, color: "#fff", textWrap: "balance" }}>
              {TITLE}
            </h1>
            <p style={{ margin: 0, maxWidth: "68ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE" }}>
              {SUB} Worth having because of a number on the other side of this site:{" "}
              <strong style={{ color: "#fff" }}>
                {uk.restricted} of the {uk.total} crypto casinos we track name the United Kingdom on their own restricted list
              </strong>{" "}
              — see <Link href="/crypto-casinos/in/gb" style={{ color: "#5FE3E8" }}>the UK crypto page</Link>. These hold a British licence instead.
            </p>
          </div>
        </section>

        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "34px 40px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: 14 }}>
            {BRANDS.map(([slug, b]) => (
              <div key={slug} id={slug} style={{ padding: "18px 20px", borderRadius: 16, background: "#0E1316", border: "1px solid rgba(255,255,255,.07)", scrollMarginTop: 110 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 12 }}>{b.name}</div>
                {b.licences.map((l) => (
                  <div key={l.accountNumber} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#DCE5E9" }}>{l.entity}</div>
                    <div style={{ fontFamily: MONO, fontSize: 12, color: "#8DA0AA", margin: "3px 0 5px" }}>Account number {l.accountNumber}</div>
                    <a href={l.detailUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>
                      Gambling Commission register ↗
                    </a>
                  </div>
                ))}
                {b.licences.length > 1 && (
                  <p style={{ margin: "0 0 0", fontSize: 12.5, lineHeight: 1.5, color: "#8DA0AA" }}>
                    Two licences. {slug === "bet365" ? "The register separates gaming from sport, which is why the casino and the sportsbook appear under different entities." : "Both are on the register against this brand's domain."}
                  </p>
                )}
              </div>
            ))}
          </div>

          <p style={{ margin: "18px 0 0", maxWidth: "76ch", fontSize: 13, lineHeight: 1.6, color: "#77858E" }}>
            Licence holders are matched to brands by domain, not by name, because the two often differ — PlayOJO&rsquo;s licence is held by Skill On Net
            Limited and Casumo&rsquo;s by Recro Limited. Read from the register on {DB.read}. Nothing about bonuses, payout times or wagering appears
            here: we have not sourced those, and an unsourced figure is worse than a missing one.
          </p>
        </section>

        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "34px 40px 80px" }}>
          <NextSteps
            steps={[
              { label: "Crypto casinos and the UK", href: "/crypto-casinos/in/gb", hint: `Why ${uk.restricted} of ${uk.total} will not take a British player.` },
              { label: "UK gambling law", href: "/legal/gb", hint: "What is legal in Great Britain, and who regulates it." },
              { label: "US-regulated casinos", href: "/us-casinos", hint: "The same question for the other market where crypto is shut out." },
            ]}
          />
        </section>
      </main>
    </>
  );
}
