import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { raceFor, raceSlugs } from "@/lib/races";
import { brandFor, casinoFacts } from "@/lib/casino-facts";
import { BrandMark } from "@/components/ui/BrandMark";
import { Icon } from "@/components/ui/Icon";

export const metadata = pageMetadata(
  "Biggest crypto casino races and raffles",
  "Daily, weekly and monthly wager races, raffles and prize draws at crypto casinos, sorted by prize money a month. Each figure comes from the casino's own promotions pages.",
  "/races"
);

const MONO = "var(--font-jetbrains-mono), monospace";
const COLS = "md:grid-cols-[40px_minmax(190px,1.1fr)_minmax(240px,1.6fr)_120px_minmax(180px,1fr)_140px]";
const KIND: Record<string, string> = { race: "Race", raffle: "Raffle", draw: "Prize draw", tournament: "Tournament" };

export default function Page() {
  const slugs = raceSlugs().filter((s) => siteData.ops.some((o) => o.slug === s));
  const total = slugs.reduce((n, s) => n + (raceFor(s)?.monthly ?? 0), 0);

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Races", path: "/races" }])} />
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(80% 120% at 85% 0%, rgba(214,182,92,.12), transparent 55%), radial-gradient(60% 80% at 0% 100%, rgba(0,194,204,.07), transparent 60%), #0A0D10" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px 40px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#5C6A72", marginBottom: 22 }}>
            <Link href="/" style={{ color: "#5C6A72" }}>Home</Link> / <span style={{ color: "#A8B6BE" }}>Races</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#D6B65C", marginBottom: 12 }}>Races & raffles</div>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(36px, 4.6vw, 54px)", lineHeight: 1.02, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff", textWrap: "balance" }}>
            The biggest crypto casino races
          </h1>
          <p style={{ margin: "0 0 26px", maxWidth: "62ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE" }}>
            Wager races, raffles and prize draws that run every day, week or month, sorted by prize money a month. You enter by playing, and every figure comes from the casino&apos;s own promotions pages.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              [String(slugs.length), "casinos with recurring races"],
              [`$${Math.round(total / 1_000_000)}M+`, "in prizes a month"],
            ].map(([v, l]) => (
              <span key={l} style={{ display: "inline-flex", alignItems: "baseline", gap: 8, padding: "9px 14px", borderRadius: 100, background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)", fontSize: 13.5, color: "#A8B6BE" }}>
                <strong style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{v}</strong>
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 80px" }}>
        <div style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,.08)", background: "linear-gradient(180deg,#0E1317,#0A0E11)", overflow: "hidden" }}>
          <div className={`hidden md:grid ${COLS} items-center gap-4`} style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,.07)", fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#6E7F88" }}>
            <span>#</span>
            <span>Casino</span>
            <span>Races & raffles</span>
            <span>Type</span>
            <span>Welcome offer</span>
            <span />
          </div>
          {slugs.map((slug, i) => {
            const o = siteData.ops.find((x) => x.slug === slug)!;
            const r = raceFor(slug)!;
            const brand = brandFor(slug);
            const href = `/casinos/${slug}`;
            return (
              <div key={slug} className={`grid grid-cols-2 ${COLS} items-center gap-x-4 gap-y-3 transition-colors hover:bg-white/[0.025]`} style={{ padding: "16px 20px", borderTop: i ? "1px solid rgba(255,255,255,.05)" : undefined, background: o.featured ? `linear-gradient(90deg, ${brand}12, transparent 60%)` : undefined }}>
                <span className="hidden md:block" style={{ fontFamily: MONO, fontSize: 12, color: i < 3 ? "#D6B65C" : "#4E5A62" }}>{String(i + 1).padStart(2, "0")}</span>
                <Link href={href} className="col-span-2 md:col-span-1" style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <span style={{ width: 36, height: 36, flex: "none", borderRadius: 10, overflow: "hidden" }}>
                    <BrandMark slug={slug} mono={o.mono} tint={brand} radius={10} fontSize={11} />
                  </span>
                  <span style={{ fontSize: 15.5, fontWeight: 800, color: "#fff" }}>{o.name}</span>
                </Link>
                <div className="col-span-2 md:col-span-1" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 800, color: "#fff" }}>
                  <span style={{ color: "#D6B65C", display: "inline-flex" }}><Icon name="trophy" size={16} /></span>
                  {r.label}
                </div>
                <div>
                  <span style={{ padding: "3px 9px", borderRadius: 100, background: "rgba(214,182,92,.12)", fontFamily: MONO, fontSize: 10, letterSpacing: ".05em", textTransform: "uppercase", color: "#D6B65C" }}>{KIND[r.kind]}</span>
                </div>
                <div className="hidden md:block" style={{ fontSize: 13, lineHeight: 1.35, color: "#A8B6BE" }}>{casinoFacts(o).headline}</div>
                <div className="col-span-2 md:col-span-1">
                  <Link href={href} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 12px", borderRadius: 10, background: o.featured ? brand : "#00C2CC", color: "#0A0D0F", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}>
                    View offer <Icon name="arrow" size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ margin: "18px 0 0", maxWidth: "80ch", fontSize: 13.5, lineHeight: 1.6, color: "#7B8A93" }}>
          Races are sorted by prize money a month (daily pools x30, weekly x4.3). Most rank players by amount wagered, some by points weighted to each game&apos;s house edge; each casino&apos;s report explains its own rules.
        </p>
      </section>
    </main>
  );
}
