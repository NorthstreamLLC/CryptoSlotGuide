import Link from "next/link";
import { NextSteps } from "@/components/layout/NextSteps";
import { statesFor, statesWithoutList, operatorClaimsFor, type UsBrand } from "@/lib/us-brands";
import { brandFactsFor } from "@/lib/us-brand-facts";
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
  const facts = brandFactsFor(brand.slug);
  // "Online casino" only where a regulator lists the brand for casino;
  // Circa and Prime are sportsbooks.
  const product = rows.some((r) => r.kind === "casino") ? "online casino" : "sportsbook";
  // "Prime Sportsbook", "Circa Sports" already say what they are.
  const called = /sport/i.test(brand.name) && product === "sportsbook" ? brand.name : `${brand.name} ${product}`;
  const sports = rows.filter((r) => r.kind === "sportsbook");
  const casino = rows.filter((r) => r.kind === "casino");
  const claimed = [
    ...operatorClaimsFor(brand.slug, "sportsbook").map((c) => ({ ...c, kind: "sports betting" })),
    ...operatorClaimsFor(brand.slug, "casino").map((c) => ({ ...c, kind: "online casino" })),
  ];

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
            {facts
              ? facts.offer
                ? `${called}: the offer, who can play, where it is licensed`
                : `${called}: who can play, where it is licensed`
              : `Where ${brand.name} is licensed`}
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
          {facts?.offer && (
            <p style={{ margin: "14px 0 0", maxWidth: "64ch", fontSize: 15.5, lineHeight: 1.6, color: "#FFC531" }}>
              <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#C7A45C", display: "block", marginBottom: 4 }}>New-player offer, from its own page</span>
              {facts.offer}.
            </p>
          )}
          {/* A count that looks complete but is not. Some states permit the
              product and publish nobody, so no brand can appear there however
              widely it operates — the number is a floor, and saying so is the
              difference between a fact and a misleading one. */}
          <p style={{ margin: "12px 0 0", maxWidth: "64ch", fontSize: 13.5, lineHeight: 1.6, color: "#8DA0AA" }}>
            These are floors, not totals.{" "}
            {statesWithoutList("sportsbook").map((s) => s.name).join(", ")} allow online sports betting but publish no operator list — Nevada licenses it
            through its casino licensees and names none of them, Florida runs betting through the Seminole compact rather than licensing books.{" "}
            {statesWithoutList("casino").map((s) => s.name).join(", ")} permits online casino with the lottery as both regulator and operator, and
            publishes no list either. A brand can be live in any of them and still not appear above.
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

        {facts && (
          <div style={{ marginBottom: 34 }}>
            {facts.groups.map((g) => (
              <div key={g.title} style={{ marginBottom: 22 }}>
                <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>{g.title}</h2>
                <div style={{ borderRadius: 13, border: "1px solid rgba(255,255,255,.08)", background: "#0C1013", overflow: "hidden" }}>
                  {g.facts.map((f, i) => (
                    <div key={f.label} className="grid grid-cols-1 md:grid-cols-[180px_1fr]" style={{ gap: 10, padding: "12px 16px", borderTop: i ? "1px solid rgba(255,255,255,.05)" : undefined }}>
                      <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#8E9CA5", paddingTop: 3 }}>{f.label}</span>
                      <span style={{ fontSize: 14, lineHeight: 1.6, color: "#C6D1D7" }}>
                        {f.value}{" "}
                        <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8", whiteSpace: "nowrap" }}>
                          {new URL(f.sourceUrl).hostname.replace(/^www\./, "")} ↗
                        </a>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p style={{ margin: 0, fontFamily: MONO, fontSize: 10.5, color: "#77858E" }}>Read from {brand.name}&rsquo;s own pages on {facts.read}. Where the regulator and the brand disagree, the regulator&rsquo;s list below is the one we rank on.</p>
          </div>
        )}

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

      {claimed.length > 0 && (
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "8px 40px 0" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>
            Claimed by {brand.name}, not on a regulator list
          </h2>
          <p style={{ margin: "0 0 14px", maxWidth: "70ch", fontSize: 13.5, lineHeight: 1.6, color: "#8DA0AA" }}>
            Shown apart from the rows above because it is a different kind of claim. Those come from a regulator&rsquo;s public record; these come from a
            page {brand.name} writes and controls — used here only for states that permit the product and publish no list of who runs it, where the
            regulator record cannot answer at all.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
            {claimed.map((c) => (
              <div key={`${c.kind}-${c.code}`} style={{ padding: "14px 16px", borderRadius: 14, background: "#0E1316", border: "1px dashed rgba(199,164,92,.35)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 15.5, fontWeight: 800, color: "#fff" }}>{stateName(c.code)}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10.5, color: "#C7A45C" }}>{c.kind}</span>
                </div>
                <p style={{ margin: "0 0 8px", fontSize: 13, lineHeight: 1.5, color: "#A8B6BE" }}>&ldquo;{c.quote}&rdquo;</p>
                <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>
                  {brand.name}&rsquo;s own page · read {c.read} ↗
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 40px 80px" }}>
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
