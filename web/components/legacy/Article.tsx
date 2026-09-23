import Link from "next/link";
import type { LegacyItem } from "@/lib/legacy";
import { readingMinutes } from "@/lib/legacy";

const MONO = "var(--font-jetbrains-mono), monospace";

/** A carried-over article, styled to match the rest of the site. */
export function Article({ item, related }: { item: LegacyItem; related: LegacyItem[] }) {
  return (
    <main style={{ background: "#07090B" }}>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 120% at 80% 0%, rgba(0,194,204,.10), transparent 55%), #0A0D10" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "34px 24px 32px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 18 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/blog" style={{ color: "#83919A" }}>Guides</Link>
            {item.categories[0] && (
              <>
                {" / "}
                <Link href={`/category/${item.categories[0].slug}`} style={{ color: "#83919A" }}>{item.categories[0].name}</Link>
              </>
            )}
          </div>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(30px, 4vw, 46px)", lineHeight: 1.08, letterSpacing: "-.03em", fontWeight: 800, color: "#fff", textWrap: "balance" }}>{item.title}</h1>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#8E9CA5" }}>
            Published {item.date}
            {item.modified !== item.date ? ` · updated ${item.modified}` : ""} · {readingMinutes(item.html)} min read
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 820, margin: "0 auto", padding: "30px 24px 72px" }}>
        {item.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt="" style={{ width: "100%", height: "auto", borderRadius: 16, marginBottom: 26 }} />
        )}
        <div className="legacy-article" dangerouslySetInnerHTML={{ __html: item.html }} />

        {related.length > 0 && (
          <>
            <h2 style={{ margin: "44px 0 12px", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>Related guides</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
              {related.map((r) => (
                <Link key={r.slug} href={`/${r.slug}`} style={{ display: "block", padding: "14px 16px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)", fontSize: 14.5, fontWeight: 700, lineHeight: 1.35, color: "#E8EDF0" }}>
                  {r.title}
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
