import Link from "next/link";
import { studioBy, countryOf } from "@/lib/studios";
import { studioThumbs, studioCatalogue } from "@/lib/slot-page";

const MONO = "var(--font-jetbrains-mono), monospace";

/**
 * The studio hero's lower half: quick facts from the studio's own site, our
 * verdict, and its best-known titles as tiles. Fills what was empty space
 * under the byline and replaces the separate verdict box further down.
 */
export function ProviderHero({ slug, name, verdict }: { slug: string; name: string; verdict: string }) {
  const s = studioBy(slug);
  const countries = s ? new Set(s.licences.map((l) => countryOf(l.code))).size : 0;
  const titles = studioCatalogue(name).titles;
  const facts = [
    s?.founded ? { k: "Founded", v: String(s.founded) } : null,
    s?.parent ? { k: "Part of", v: s.parent } : null,
    countries ? { k: "Licensed in", v: `${countries} countries` } : null,
    titles ? { k: "On our index", v: `${titles.toLocaleString("en-GB")} slots` } : null,
  ].filter((x): x is { k: string; v: string } => !!x);
  const thumbs = studioThumbs(name, 4);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 22 }}>
      {facts.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(facts.length, 4)}, minmax(0,1fr))`, gap: 1, borderRadius: 12, overflow: "hidden", background: "rgba(255,255,255,.07)" }}>
          {facts.map((f) => (
            <div key={f.k} style={{ padding: "12px 14px", background: "#0E1317" }}>
              <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#7F8D96", marginBottom: 4 }}>{f.k}</div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: "#fff", lineHeight: 1.25 }}>{f.v}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ padding: "16px 18px", borderRadius: 12, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 6 }}>Verdict</div>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "#DCE5E9" }}>{verdict}</p>
      </div>
      {thumbs.length > 0 && (
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#7F8D96", marginBottom: 8 }}>Popular {name} slots</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 10 }}>
            {thumbs.map((t) => (
              <Link key={t.href} href={t.href} className="csg-lift group" style={{ display: "block", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)", background: "#11161A" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.src} alt={t.name} loading="lazy" style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", display: "block" }} />
                <span style={{ display: "block", padding: "6px 8px", fontSize: 11.5, fontWeight: 700, color: "#E8EDF0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
