import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { US_STATES, stateBy, sweepsAvailableIn, toneOf } from "@/lib/legal";
import { marketFor } from "@/lib/us-market";
import { operatorsInState } from "@/lib/us-brands";
import { brandFor } from "@/lib/casino-facts";
import { tintFor } from "@/lib/logo";
import { BrandMark } from "@/components/ui/BrandMark";
import { LandingShell, LinkCloud } from "@/components/landing/LandingShell";
import { NextSteps } from "@/components/layout/NextSteps";

const MONO = "var(--font-jetbrains-mono), monospace";

/**
 * One page per state, the way a reader searches: "online casinos in
 * Michigan". Three honest shapes, decided by the state's own law:
 *
 *   live       the regulator's licensed casino list, resolved to brand
 *              profiles — the only list a US page can stand behind, since
 *              no crypto casino we track accepts US players by its own terms
 *   not live   the law says yes and nothing is open yet (Maine): the law,
 *              what is live instead, and what is pending
 *   not legal  what the law says, sweepstakes casinos where the state
 *              allows them (each by its own restricted-states list), and
 *              the bills in play
 *
 * Nothing here is sold: no US brand has a deal with us, so every link goes
 * to the brand's profile and the order is the measured footprint.
 */
export function generateStaticParams() {
  return US_STATES.map((s) => ({ state: s.code.toLowerCase() }));
}

function shape(code: string) {
  const s = stateBy(code);
  if (!s) return null;
  const market = marketFor(s.code);
  const live = operatorsInState(s.code, "casino");
  const tone = toneOf(s.onlineCasino);
  // toneOf reads "not legal" as banned and "legal, not yet live" as legal;
  // a bare /legal/ test matched both and called Alabama "legal, not yet live".
  const kind = live.length ? "live" : tone === "legal" ? "not-live" : "not-legal";
  const sweeps = sweepsAvailableIn(s.name, s.code);
  const sweepsBanned = toneOf(s.sweepstakes) === "banned";
  const open = sweepsBanned ? [] : sweeps.filter((x) => x.known && !x.excluded).map((x) => x.s);
  const books = operatorsInState(s.code, "sportsbook");
  return { s, market, live, kind, open, sweepsBanned, books } as const;
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const d = shape(state);
  if (!d) return {};
  const { s, live, kind, open } = d;
  const title =
    kind === "live"
      ? `Online casinos in ${s.name}: the ${live.length} the regulator licenses`
      : kind === "not-live"
        ? `Online casinos in ${s.name}: legal, not yet live`
        : open.length
          ? `Online casinos in ${s.name}: not legal, ${open.length} sweepstakes casinos you can play`
          : `Online casinos in ${s.name}: what the law says`;
  const sub =
    kind === "live"
      ? `Every online casino ${s.name}'s regulator lists, from its own published list, with each brand's profile.`
      : `${s.name}'s online casino law from its own regulator, what is live instead, and what is pending.`;
  return pageMetadata(title, sub, `/us-casinos/in/${state}`);
}

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const d = shape(state);
  if (!d) notFound();
  const { s, market, live, kind, open, sweepsBanned, books } = d;
  const path = `/us-casinos/in/${state}`;
  const title =
    kind === "live"
      ? `Online casinos in ${s.name}`
      : kind === "not-live"
        ? `Online casinos in ${s.name}: legal, not yet live`
        : `Online casinos in ${s.name}: what the law says`;
  const listed = kind === "live"
    ? live.map((r) => ({ name: r.brand?.name ?? r.listing, path: r.brand ? `/us-casinos/${r.brand.slug}` : path }))
    : open.map((c) => ({ name: c.name, path: `/sweepstakes-casinos/${c.slug}` }));
  const others = US_STATES.filter((x) => x.code !== s.code).sort((a, b) => a.name.localeCompare(b.name));
  const liveSource = market?.casinos?.sourceUrl ?? s.licensedListUrl ?? null;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "US-regulated casinos", path: "/us-casinos" }, { name: s.name, path }]),
          collectionPageSchema(title, `${s.name} online casinos, from the state's own regulator.`, path),
          itemListSchema(title, listed),
        ].filter(Boolean)}
      />
      <LandingShell
        crumbs={[{ label: "Home", href: "/" }, { label: "US-regulated casinos", href: "/us-casinos" }, { label: s.name }]}
        eyebrow={`Online casinos · ${s.name}`}
        title={title}
        intro={
          <p style={{ margin: 0, maxWidth: "70ch", fontSize: 16.5, lineHeight: 1.65, color: "#A8B6BE" }}>
            {s.note ?? `What ${s.name}'s own regulator says about online casinos, sports betting and sweepstakes.`}
          </p>
        }
        chips={[
          `Online casinos: ${s.onlineCasino ?? "not stated"}`,
          `Sports betting: ${s.sportsBetting ?? "not stated"}`,
          `Sweepstakes: ${s.sweepstakes ?? "not stated"}`,
          ...(s.minAge ? [`Minimum age ${s.minAge}`] : []),
        ]}
      >
        {kind === "live" && (
          <section style={{ maxWidth: 1180, margin: "0 auto", padding: "30px 24px 0" }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, letterSpacing: "-.025em", color: "#fff" }}>
              The {live.length} online casinos {s.name} licenses
            </h2>
            <p style={{ margin: "0 0 16px", maxWidth: "72ch", fontSize: 14.5, lineHeight: 1.6, color: "#8DA0AA" }}>
              Read off the regulator&apos;s own list{liveSource ? <> (<a href={liveSource} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#5FE3E8" }}>source ↗</a>)</> : null}, biggest multi-state footprint first.
              A brand without a profile yet is still listed — being licensed does not depend on us having written it up.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
              {live.map((r, i) => {
                const slug = r.brand?.slug ?? null;
                const inner = (
                  <>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", width: 22 }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ width: 34, height: 34, flex: "none", borderRadius: 9, overflow: "hidden" }}>
                      <BrandMark slug={slug ?? r.listing} mono={(r.brand?.name ?? r.listing).slice(0, 2).toUpperCase()} tint={slug ? brandFor(slug) : tintFor(r.listing)} radius={9} fontSize={10} />
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 15, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.brand?.name ?? r.listing}</span>
                      <span style={{ display: "block", fontFamily: MONO, fontSize: 10, color: "#8E9CA5", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r.licenseHolder ? `Licence holder: ${r.licenseHolder}` : r.listing}
                      </span>
                    </span>
                  </>
                );
                const style = { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" } as const;
                return slug ? (
                  <Link key={slug} href={`/us-casinos/${slug}`} style={style}>{inner}</Link>
                ) : (
                  <div key={r.listing} style={style}>{inner}</div>
                );
              })}
            </div>
          </section>
        )}

        {kind !== "live" && (
          <section style={{ maxWidth: 1180, margin: "0 auto", padding: "30px 24px 0" }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, letterSpacing: "-.025em", color: "#fff" }}>
              {kind === "not-live" ? "Authorised, with nothing open yet" : `No licensed online casino in ${s.name}`}
            </h2>
            <p style={{ margin: "0 0 10px", maxWidth: "72ch", fontSize: 15, lineHeight: 1.65, color: "#A8B6BE" }}>
              {s.onlineCasino ? `${s.name}'s regulator lists online casinos as ${s.onlineCasino}.` : ""} {market?.why ?? ""}
            </p>
            {market?.legalToday && <p style={{ margin: "0 0 10px", maxWidth: "72ch", fontSize: 15, lineHeight: 1.65, color: "#A8B6BE" }}>{market.legalToday}</p>}
            {books.length > 0 && (
              <p style={{ margin: "0 0 10px", maxWidth: "72ch", fontSize: 14.5, lineHeight: 1.6, color: "#8DA0AA" }}>
                Sports betting is live: the regulator lists {books.length} online sportsbook{books.length === 1 ? "" : "s"}, among them{" "}
                {books.slice(0, 4).map((b) => b.brand?.name ?? b.listing).join(", ")}.
              </p>
            )}
            {market?.pending?.length ? (
              <div style={{ marginTop: 14, borderRadius: 12, border: "1px solid rgba(255,255,255,.08)", background: "#0C1013", overflow: "hidden" }}>
                {market.pending.map((b, i) => (
                  <div key={`${b.bill}-${i}`} style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 12, padding: "11px 16px", borderTop: i ? "1px solid rgba(255,255,255,.05)" : undefined }}>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: "#5FE3E8" }}>{b.bill}</span>
                    <span style={{ fontSize: 13.5, lineHeight: 1.5, color: "#B7C4CB" }}>{b.topic} — {b.status}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        )}

        {kind !== "live" && !sweepsBanned && open.length > 0 && (
          <section style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 24px 0" }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, letterSpacing: "-.025em", color: "#fff" }}>
              {open.length} sweepstakes casinos you can play from {s.name}
            </h2>
            <p style={{ margin: "0 0 16px", maxWidth: "72ch", fontSize: 14.5, lineHeight: 1.6, color: "#8DA0AA" }}>
              Each one&apos;s own restricted-states list does not name {s.name}. Sweepstakes casinos run on free coins with prizes redeemable for cash, which is how they operate where online casinos are not legal — the law tile above says whether {s.name} allows them.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 10 }}>
              {open.map((c, i) => (
                <Link key={c.slug} href={`/sweepstakes-casinos/${c.slug}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", width: 22 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ width: 34, height: 34, flex: "none", borderRadius: 9, overflow: "hidden" }}>
                    <BrandMark slug={c.slug} mono={c.name.slice(0, 2).toUpperCase()} tint={brandFor(c.slug)} radius={9} fontSize={10} />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 15, fontWeight: 800, color: "#fff" }}>{c.name}</span>
                    {c.offer && <span style={{ display: "block", fontSize: 12, color: "#8DA0AA", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.offer}</span>}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {kind !== "live" && sweepsBanned && (
          <section style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 24px 0" }}>
            <p style={{ margin: 0, maxWidth: "72ch", fontSize: 14.5, lineHeight: 1.6, color: "#8DA0AA" }}>
              Sweepstakes casinos are {s.sweepstakes} in {s.name}, so none are listed here. No crypto casino we track accepts US players by its own terms either — 41 of 46 name the United States on their restricted lists.
            </p>
          </section>
        )}

        <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px 72px" }}>
          <LinkCloud title="Other states" items={others.map((x) => ({ href: `/us-casinos/in/${x.code.toLowerCase()}`, label: x.name }))} />
          <NextSteps
            steps={[
              { href: `/legal/us/${state}`, label: `${s.name} gambling law in full`, hint: "The regulator, the statute, the sources — every status above, cited." },
              { href: "/us-casinos", label: "US-regulated casinos", hint: "Every brand, ranked by how many states license it." },
              { href: "/sweepstakes-casinos", label: "Sweepstakes casinos", hint: "The 28 we track, each with its own restricted-states list." },
            ]}
          />
        </section>
      </LandingShell>
    </>
  );
}
