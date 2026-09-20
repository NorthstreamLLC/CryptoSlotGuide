import Link from "next/link";
import type { LegacyItem } from "@/lib/legacy";

const MONO = "var(--font-jetbrains-mono), monospace";

/** Card grid of guides, used by /blog and the category pages. */
export function PostGrid({ posts, readingMinutes }: { posts: LegacyItem[]; readingMinutes: (html: string) => number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
      {posts.map((p) => (
        <Link key={p.slug} href={`/${p.slug}`} style={{ display: "flex", flexDirection: "column", borderRadius: 16, overflow: "hidden", background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
          {p.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image} alt="" style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover" }} />
          ) : (
            <span style={{ width: "100%", aspectRatio: "16 / 9", background: "linear-gradient(135deg,#101820,#0B0F12)" }} />
          )}
          <span style={{ display: "flex", flexDirection: "column", gap: 8, padding: "16px 18px" }}>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: "#00C2CC" }}>
              {p.categories[0]?.name ?? "Guide"} · {readingMinutes(p.html)} min
            </span>
            <span style={{ fontSize: 16, lineHeight: 1.3, fontWeight: 800, color: "#fff" }}>{p.title}</span>
            <span style={{ fontSize: 13, lineHeight: 1.5, color: "#8DA0AA", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.excerpt}</span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: "#5C6A72", marginTop: "auto" }}>{p.date}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
