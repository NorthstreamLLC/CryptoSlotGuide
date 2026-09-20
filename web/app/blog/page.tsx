import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { legacyPosts, LEGACY_CATEGORIES, readingMinutes } from "@/lib/legacy";
import { LandingShell } from "@/components/landing/LandingShell";
import { PostGrid } from "@/components/legacy/PostGrid";

export const metadata = pageMetadata(
  "Crypto casino guides",
  "Guides on crypto casino bonuses, wagering, withdrawals, RTP, provably fair games, no-KYC play and staying safe, written by the CryptoSlotGuide desk.",
  "/blog"
);

export default function Page() {
  const posts = legacyPosts();
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Guides", path: "/blog" }])} />
      <LandingShell
        crumbs={[{ label: "Home", href: "/" }, { label: "Guides" }]}
        eyebrow="Guides"
        title="Crypto casino guides"
        intro={`${posts.length} guides on bonuses and wagering, withdrawals, RTP, provably fair games, no-KYC play and staying safe.`}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {LEGACY_CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} style={{ padding: "8px 14px", borderRadius: 100, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)", fontSize: 13, fontWeight: 600, color: "#C6D1D7" }}>
              {c.name} <span style={{ opacity: 0.55 }}>{c.count}</span>
            </Link>
          ))}
        </div>
        <PostGrid posts={posts} readingMinutes={readingMinutes} />
      </LandingShell>
    </>
  );
}
