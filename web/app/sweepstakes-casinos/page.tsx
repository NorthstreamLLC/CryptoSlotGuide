import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps } from "@/components/layout/NextSteps";
import { sweepsSorted, sweepsFact, shortFact } from "@/lib/sweeps";
import { brandFor } from "@/lib/casino-facts";
import { BrandMark } from "@/components/ui/BrandMark";
import { Icon } from "@/components/ui/Icon";

export const metadata = pageMetadata(
  "Best US sweepstakes casinos compared",
  "Every major US sweepstakes casino side by side: the free welcome coins, daily bonus, minimum redemption, how fast prizes pay out, crypto purchases and which states are excluded. Each figure comes from the casino's own rules.",
  "/sweepstakes-casinos"
);

const MONO = "var(--font-jetbrains-mono), monospace";
const COLS = "md:grid-cols-[minmax(180px,1fr)_minmax(220px,1.4fr)_minmax(150px,1fr)_120px_130px_80px_130px]";

export default function Page() {
  const list = sweepsSorted();
  const withCrypto = list.filter((s) => sweepsFact(s, "Crypto")).length;

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Sweepstakes casinos", path: "/sweepstakes-casinos" }])} />
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(80% 120% at 85% 0%, rgba(87,227,154,.10), transparent 55%), radial-gradient(60% 80% at 0% 100%, rgba(0,194,204,.07), transparent 60%), #0A0D10" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px 40px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 22 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <span style={{ color: "#A8B6BE" }}>Sweepstakes casinos</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#57E39A", marginBottom: 12 }}>United States</div>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(36px, 4.6vw, 54px)", lineHeight: 1.02, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff", textWrap: "balance" }}>
            Best US sweepstakes casinos compared
          </h1>
          <p style={{ margin: "0 0 26px", maxWidth: "64ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE" }}>
            Sweepstakes casinos are legal in most US states. You play with Gold Coins for fun and Sweeps Coins that can be redeemed for real prizes, and no purchase is ever needed to play. Here are {list.length} of them side by side, with every figure taken from each casino&apos;s own sweepstakes rules.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              ["gift", `${list.length} sweepstakes casinos`],
              ["coins", `${withCrypto} accept crypto`],
              ["shield", "States, redemptions & daily bonuses"],
            ].map(([icon, text]) => (
              <span key={text} style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "9px 14px", borderRadius: 100, background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)", fontSize: 13.5, fontWeight: 600, color: "#E8EDF0" }}>
                <span style={{ color: "#57E39A", display: "inline-flex" }}><Icon name={icon as "gift"} size={16} /></span>
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 80px" }}>
        {list.length === 0 ? (
          <p style={{ color: "#8DA0AA" }}>The list is being compiled from each casino&apos;s own rules.</p>
        ) : (
          <div style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,.08)", background: "linear-gradient(180deg,#0E1317,#0A0E11)", overflow: "hidden" }}>
            <div className={`hidden md:grid ${COLS} items-center gap-4`} style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,.07)", fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#8E9CA5" }}>
              <span>Casino</span>
              <span>Welcome offer</span>
              <span>Daily bonus</span>
              <span>Min. redemption</span>
              <span>Crypto</span>
              <span>Age</span>
              <span />
            </div>
            {list.map((s, i) => {
              const brand = brandFor(s.slug);
              const href = `/sweepstakes-casinos/${s.slug}`;
              const cell = (label: string, value: string | null, color = "#fff") => (
                <div style={{ minWidth: 0 }}>
                  <div className="md:hidden" style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".07em", textTransform: "uppercase", color: "#8E9CA5", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.35, fontWeight: 700, color: value ? color : "#77858E" }}>{value ?? "—"}</div>
                </div>
              );
              const crypto = sweepsFact(s, "Crypto");
              const age = sweepsFact(s, "Minimum age")?.value.match(/\d{2}\+?/)?.[0];
              return (
                <div key={s.slug} className={`grid grid-cols-2 ${COLS} items-center gap-x-4 gap-y-3 transition-colors hover:bg-white/[0.025]`} style={{ padding: "16px 20px", borderTop: i ? "1px solid rgba(255,255,255,.05)" : undefined }}>
                  <Link href={href} className="col-span-2 md:col-span-1" style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <span style={{ width: 36, height: 36, flex: "none", borderRadius: 10, overflow: "hidden" }}>
                      <BrandMark slug={s.slug} mono={s.name.slice(0, 2).toUpperCase()} tint={brand} radius={10} fontSize={11} />
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 15.5, fontWeight: 800, color: "#fff" }}>{s.name}</span>
                      <span style={{ display: "block", fontFamily: MONO, fontSize: 10, color: "#8E9CA5" }}>{s.domain}</span>
                    </span>
                  </Link>
                  <Link href={href} className="col-span-2 md:col-span-1" style={{ fontSize: 14.5, lineHeight: 1.3, fontWeight: 700, color: "#E8EDF0" }}>
                    {s.offer}
                  </Link>
                  {cell("Daily bonus", shortFact(sweepsFact(s, "Daily bonus"), 40))}
                  {cell("Min. redemption", shortFact(sweepsFact(s, "Minimum redemption")))}
                  {cell("Crypto", crypto ? shortFact(crypto, 30) : "No", crypto ? "#7BE0B8" : "#8E9CA5")}
                  {cell("Age", age ?? null)}
                  <div className="col-span-2 md:col-span-1">
                    <Link href={href} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 12px", borderRadius: 10, background: "#57E39A", color: "#0A0D0F", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}>
                      View offer <Icon name="arrow" size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14, marginTop: 24 }}>
          {[
            ["Gold Coins vs Sweeps Coins", "Gold Coins are for fun and have no cash value. Sweeps Coins come free with your welcome offer, daily logins and Gold Coin packages, and once played through (usually 1×) they can be redeemed for cash or gift cards."],
            ["Is it legal where I live?", "Sweepstakes casinos run under US sweepstakes law, so no purchase is needed to play and there is always a free way to enter, usually a mail-in request. Each casino lists the states it excludes; check yours on its report."],
            ["Redeeming prizes", "Most casinos ask you to verify your identity before your first redemption. Minimums and payout times differ a lot between casinos, which is why they are in the table above."],
          ].map(([t, b]) => (
            <div key={t} style={{ padding: "24px 26px", borderRadius: 18, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{t}</div>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: "#A8B6BE" }}>{b}</p>
            </div>
          ))}
        </div>

        <NextSteps
          steps={[
            { href: "/legal/us", label: "Is it legal in your state?", hint: "All 50 states and DC, with each state's sweepstakes position." },
            { href: "/crypto-casinos", label: "Crypto casinos", hint: "The real-money side: coins, payout times and welcome offers." },
            { href: "/bonuses", label: "Every bonus", hint: "Welcome offers and rewards with the wagering each one carries." },
            { href: "/how-we-rate", label: "How we source every fact", hint: "Every figure here comes from the casino's own rules pages." },
          ]}
        />
      </section>
    </main>
  );
}
