import Link from "next/link";
import { CasinoIndexPage } from "@/components/casino-index/CasinoIndexPage";
import { btcViews, defaultIndexList } from "@/lib/casino-index";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/lib/schema";

const FILTER = "fast" as const;
const PATH = "/fastest-payouts";
const view = btcViews[FILTER];

export const metadata = pageMetadata(view.h1, view.p, PATH);

export default function Page() {
  // The list in the order the page first paints it. defaultIndexList shares
  // its sort with the component's initial state, so the schema cannot drift
  // from what a crawler actually sees.
  const list = defaultIndexList(FILTER).map((o) => ({ name: o.name, path: `/casinos/${o.slug}` }));
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: view.crumb, path: PATH }]),
          collectionPageSchema(view.h1, view.p, PATH),
          itemListSchema(view.h1, list),
        ]}
      />
      <CasinoIndexPage filter={FILTER} />
      <div style={{ background: "#080B0D", padding: "0 24px 72px" }}>
        <Link href="/crypto-casino-withdrawals-explained" className="csg-card" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, maxWidth: 1112, margin: "0 auto", padding: "22px 26px", borderRadius: 16, background: "#0D1114", border: "1px solid rgba(255,255,255,.08)" }}>
          <span>
            <span style={{ display: "block", fontSize: 19, fontWeight: 700, color: "#F2F5F7" }}>How crypto casino withdrawals work</span>
            <span style={{ display: "block", marginTop: 4, fontSize: 14.5, color: "#8E9CA4" }}>Stated times, minimums, maximums and fees at every casino, how long each coin&apos;s network takes, and what holds a payout up.</span>
          </span>
          <span style={{ padding: "12px 18px", borderRadius: 11, border: "1px solid rgba(255,255,255,.16)", color: "#E8EDF0", fontSize: 14.5, fontWeight: 700, whiteSpace: "nowrap" }}>Read the guide →</span>
        </Link>
      </div>
    </>
  );
}
