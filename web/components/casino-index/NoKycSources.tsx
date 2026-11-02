import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { getSpecFact } from "@/lib/spec-sheet";
import { inHouseOrder } from "@/lib/house-order";
import { brandFor } from "@/lib/casino-facts";
import { BrandMark } from "@/components/ui/BrandMark";

const MONO = "var(--font-jetbrains-mono), monospace";

/**
 * Under the no-KYC list: each listed casino's own words on ID checks, with the
 * page they're from. "No-KYC" is a label; the terms are what a player is held to.
 */
export function NoKycSources() {
  const rows = inHouseOrder(siteData.ops.filter((o) => o.kyc === "none")).flatMap((o) => {
    const f = getSpecFact(o.slug, "Compliance", "KYC policy");
    return f?.sourceUrl && typeof f.value === "string" ? [{ o, f }] : [];
  });
  if (!rows.length) return null;
  return (
    <section style={{ maxWidth: 1400, margin: "0 auto", padding: "10px 40px 60px" }}>
      <div style={{ maxWidth: 900 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 26, letterSpacing: "-.02em", fontWeight: 800, color: "#fff" }}>What each casino&apos;s own terms say about ID checks</h2>
        <p style={{ margin: "0 0 18px", fontSize: 15, lineHeight: 1.6, color: "#A8B6BE" }}>
          &quot;No-KYC&quot; is a marketing label, not a licence category: every casino here reserves the right to ask for documents, usually at a threshold or before a withdrawal. Here is each one&apos;s own wording, linked to the page it comes from. Licences are checked on the regulator&apos;s own register, such as{" "}
          <a href="https://www.cga.cw/en/133i348441001" target="_blank" rel="noopener noreferrer" style={{ color: "#5FE3E8", fontWeight: 600 }}>Curaçao&apos;s</a> or{" "}
          <a href="https://verification.anjouangamingboard.org" target="_blank" rel="noopener noreferrer" style={{ color: "#5FE3E8", fontWeight: 600 }}>Anjouan&apos;s</a>.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map(({ o, f }) => (
            <div key={o.slug} style={{ display: "grid", gridTemplateColumns: "34px 1fr", gap: 12, alignItems: "start", padding: "12px 14px", borderRadius: 12, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, overflow: "hidden" }}>
                <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={9} fontSize={11} />
              </span>
              <span style={{ minWidth: 0 }}>
                <Link href={`/casinos/${o.slug}`} style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{o.name}</Link>
                <span style={{ display: "block", margin: "3px 0 5px", fontSize: 14, lineHeight: 1.5, color: "#B7C4CB" }}>{f.value as string}</span>
                <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>
                  {new URL(f.sourceUrl!).hostname.replace(/^www\./, "")} ↗{f.asOf ? ` · checked ${f.asOf}` : ""}
                </a>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
