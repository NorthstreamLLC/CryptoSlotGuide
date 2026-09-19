import { ComparePage } from "@/components/compare/ComparePage";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import { versusPairs, pairSlug } from "@/lib/versus";
import { siteData } from "@/lib/site-data";

export const metadata = pageMetadata(
  "Compare operators side by side",
  "Pick any two or three operators — casinos, wallets, exchanges, sportsbooks — and compare their listed figures column by column.",
  "/compare"
);

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Compare", path: "/compare" }])} />
      <ComparePage />
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px 80px" }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 26, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>Popular head-to-heads</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {versusPairs().map(([a, b]) => (
            <Link key={pairSlug(a, b)} href={`/compare/${pairSlug(a, b)}`} style={{ padding: "8px 13px", borderRadius: 100, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)", fontSize: 13, fontWeight: 600, color: "#C6D1D7" }}>
              {siteData.ops.find((o) => o.slug === a)?.name} vs {siteData.ops.find((o) => o.slug === b)?.name}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
