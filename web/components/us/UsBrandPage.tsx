import Link from "next/link";
import { NextSteps } from "@/components/layout/NextSteps";
import { statesFor, type UsBrand } from "@/lib/us-brands";
import { US_STATES } from "@/lib/legal";

/**
 * One US-regulated brand: which state regulators list it, for which product,
 * under whose licence, with the regulator page behind every row.
 *
 * The page makes no claim of its own. A state appears because that state's
 * own regulator names the brand on a list we read on a recorded date, and the
 * wording throughout is "listed by" rather than "operates in" — some
 * regulator lists lag a rebrand, and we are citing the list, not the lobby.
 */

const MONO = "var(--font-jetbrains-mono), monospace";
const NAME_OF = new Map(US_STATES.map((s) => [s.code, s.name]));
const stateName = (code: string) => NAME_OF.get(code) ?? code;

function Count({ n, label, tint }: { n: number; label: string; tint: string }) {
  return (
    <div style={{ padding: "16px 18px", borderRadius: 14, background: "#0E1316", border: "1px solid rgba(255,255,255,.07)", minWidth: 0 }}>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#8E9CA5", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.03em", color: n ? tint : "#77858E" }}>{n}</div>
    </div>
  );
}

export function UsBrandPage({ brand }: { brand: UsBrand }) {
  const rows = statesFor(brand.slug);
  const sports = rows.filter((r) => r.kind === "sportsbook");
  const casino = rows.filter((r) => r.kind === "casino");

  return (
    <main style={{ background: "#07090B", color: "#E8EDF0" }}>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(100% 100% at 20% 0%, rgba(0,194,204,.07), transparent 60%), #0B0F12" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 40px 44px" }}>
          <nav style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 20 }}>
            <Link href="/us-casinos" style={{ color: "#83919A" }}>US regulated</Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <span>{brand.name}</span>
          </nav>
          <h1 style={{ margin: "0 0 12px", fontSize: 40, lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 800, color: "#fff", textWrap: "balance" }}>
            Where {brand.name} is licensed
          </h1>
          <p style={{ margin: 0, maxWidth: "64ch", fontSize: 16, lineHeight: 1.6, color: "#A8B6BE" }}>
            {sports.length > 0 && (
              <>
                {sports.length} state {sports.length === 1 ? "regulator lists" : "regulators list"} {brand.name} for sports betting
                {casino.length > 0 ? " and " : ". "}
              </>
            )}
            {casino.length > 0 && (
              <>
                {casino.length} for online casino{sports.length === 0 ? ` ${casino.length === 1 ? "regulator lists" : "regulators list"} ${brand.name}` : ""}.{" "}
              </>
            )}
            Every row below is the regulator&rsquo;s own published list, linked.
          </p>
          {brand.caveat && (
            <p style={{ margin: "14px 0 0", maxWidth: "64ch", padding: "12px 14px", borderRadius: 12, background: "rgba(199,164,92,.08)", border: "1px solid rgba(199,164,92,.25)", fontSize: 13.5, lineHeight: 1.55, color: "#D8C79B" }}>
              {brand.caveat}
            </p>
          )}
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 40px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 30 }}>
          <Count n={sports.length} label="Sports betting states" tint="#5FE3E8" />
          <Count n={casino.length} label="Online casino states" tint="#7BE0B8" />
        </div>

        {([["Sports betting", sports], ["Online casino", casino]] as const).map(([title, list]) =>
          list.length === 0 ? null : (
            <div key={title} style={{ marginBottom: 30 }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>{title}</h2>
              <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,.08)", background: "#0C1013", overflow: "hidden" }}>
                {list.map((r, i) => (
                  <div
                    key={`${r.kind}-${r.code}`}
                    className="grid grid-cols-1 md:grid-cols-[minmax(140px,1fr)_minmax(180px,1.4fr)_auto]"
                    style={{ gap: 12, padding: "12px 18px", alignItems: "center", borderTop: i ? "1px solid rgba(255,255,255,.05)" : undefined }}
                  >
                    <Link href={`/legal/us/${r.code.toLowerCase()}`} style={{ fontSize: 15, fontWeight: 700, color: "#E8EDF0" }}>
                      {stateName(r.code)}
                    </Link>
                    <span style={{ fontSize: 13, color: "#8DA0AA", overflowWrap: "anywhere" }}>
                      {r.licenseHolder ? <>Licence held by {r.licenseHolder}</> : "Licence holder not stated"}
                    </span>
                    {r.sourceUrl && (
                      <a
                        href={r.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8", whiteSpace: "nowrap" }}
                      >
                        regulator list{r.asOf ? ` · ${r.asOf}` : ""} ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px 80px" }}>
        <NextSteps
          steps={[
            { label: "Every US-regulated brand", href: "/us-casinos", hint: "Who is licensed where, across sports betting and online casino." },
            { label: "State-by-state gambling law", href: "/legal/us", hint: "What is legal in each state, and what the legislature is doing about it." },
            { label: "Crypto casinos", href: "/crypto-casinos", hint: "Offshore operators that take crypto, compared on their own terms." },
          ]}
        />
      </section>
    </main>
  );
}
