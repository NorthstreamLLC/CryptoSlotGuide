import { getSpecFact } from "@/lib/spec-sheet";

const MONO = "var(--font-jetbrains-mono), monospace";

/** A titled fact with a link to the page it came from: the building block of the promo code pages. */
export function SourcedCard({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <div style={{ padding: "16px 18px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{title}</div>
      <p style={{ margin: "0 0 8px", fontSize: 13.5, lineHeight: 1.55, color: "#A8B6BE" }}>{body}</p>
      <a href={href} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>
        {new URL(href).hostname.replace(/^www\./, "")} ↗
      </a>
    </div>
  );
}

/** One cited fact from a casino's spec sheet; nothing renders if the fact is gone. */
export function SpecFactCard({ slug, group, label, sub }: { slug: string; group: string; label: string; sub?: string }) {
  const f = getSpecFact(slug, group, label);
  if (!f || typeof f.value !== "string" || !f.sourceUrl) return null;
  return <SourcedCard title={sub ?? label} body={f.value} href={f.sourceUrl} />;
}
