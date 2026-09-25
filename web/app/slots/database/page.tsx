import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps } from "@/components/layout/NextSteps";
import { FeaturedPartner } from "@/components/ui/FeaturedPartner";
import { querySlots, studioFacets, volatilityFacets, catalogueTotals, catalogueAsOf, PER_PAGE, type SlotQuery } from "@/lib/slot-db";

const MONO = "var(--font-jetbrains-mono), monospace";
const t = catalogueTotals();

export const metadata = pageMetadata(
  "Slot database: RTP, volatility and max win for every slot we track",
  `Published RTP, volatility and max-win ceiling for ${t.slots.toLocaleString()} slots from ${t.studios} studios, each figure as the studio publishes it. Filter by studio, RTP band or volatility.`,
  "/slots/database"
);

/** Rebuilds the current URL with one filter changed, so every control is a link. */
function href(cur: SlotQuery, patch: Partial<SlotQuery>): string {
  const next = { ...cur, ...patch };
  const p = new URLSearchParams();
  if (next.q) p.set("q", next.q);
  if (next.studio) p.set("studio", next.studio);
  if (next.vol) p.set("vol", next.vol);
  if (next.rtp) p.set("rtp", next.rtp);
  if (next.versions) p.set("versions", next.versions);
  if (next.sort) p.set("sort", next.sort);
  // Changing a filter always returns to page 1; keeping the old page number
  // would land the reader on an empty page of a smaller result set.
  if (next.page && next.page > 1 && !("page" in patch === false && Object.keys(patch).length)) p.set("page", String(next.page));
  if (patch.page && patch.page > 1) p.set("page", String(patch.page));
  const s = p.toString();
  return s ? `/slots/database?${s}` : "/slots/database";
}

const chip = (active: boolean) => ({
  padding: "7px 12px",
  borderRadius: 100,
  border: `1px solid ${active ? "rgba(0,194,204,.45)" : "rgba(255,255,255,.12)"}`,
  background: active ? "rgba(0,194,204,.12)" : "rgba(12,16,19,.6)",
  fontFamily: MONO,
  fontSize: 10.5,
  letterSpacing: ".04em",
  textTransform: "uppercase" as const,
  color: active ? "#5FE3E8" : "#8E9CA5",
  whiteSpace: "nowrap" as const,
});

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const q: SlotQuery = {
    q: sp.q,
    studio: sp.studio,
    vol: sp.vol,
    rtp: sp.rtp,
    versions: sp.versions,
    sort: sp.sort,
    page: sp.page ? Number(sp.page) : 1,
  };
  const res = querySlots(q);
  const studios = studioFacets();
  const vols = volatilityFacets();
  const filtered = !!(q.q || q.studio || q.vol || q.rtp || q.versions);

  return (
    <main style={{ background: "#07090B", color: "#E8EDF0" }}>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Slots", path: "/slots" }, { name: "Slot database", path: "/slots/database" }])} />

      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 120% at 80% 0%, rgba(0,194,204,.09), transparent 55%), #0A0D10" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "44px 40px 34px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 18 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/slots" style={{ color: "#83919A" }}>Slots</Link> / <span style={{ color: "#A8B6BE" }}>Database</span>
          </div>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(32px, 4.2vw, 48px)", lineHeight: 1.03, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff", textWrap: "balance" }}>
            Every slot we track, by the numbers
          </h1>
          <p style={{ margin: "0 0 20px", maxWidth: "74ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE", textWrap: "pretty" }}>
            Published RTP, volatility and max-win ceiling for {t.slots.toLocaleString()} slots from {t.studios} studios. Every figure is the one the studio publishes — where an operator
            ships a lower-RTP build of the same game, the lobby will not tell you, so check the paytable inside the game before you play.
          </p>
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap", fontFamily: MONO, fontSize: 11.5, color: "#8E9CA5" }}>
            <span><strong style={{ color: "#fff" }}>{t.withRtp.toLocaleString()}</strong> with a published RTP</span>
            <span>median <strong style={{ color: "#fff" }}>{t.median?.toFixed(2)}%</strong></span>
            <span>{t.studios} studios</span>
            <span>as of {catalogueAsOf}</span>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 40px 80px" }}>
        {/* Filters are links, so the state is in the URL, shareable, and the
            table exists without JavaScript. */}
        <form method="get" action="/slots/database" style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <input
            type="search"
            name="q"
            defaultValue={q.q ?? ""}
            placeholder="Search a slot or studio…"
            style={{ flex: "1 1 260px", minWidth: 0, padding: "11px 14px", borderRadius: 10, background: "#0C1013", border: "1px solid rgba(255,255,255,.12)", fontSize: 14, color: "#E8EDF0" }}
          />
          {q.studio && <input type="hidden" name="studio" value={q.studio} />}
          {q.vol && <input type="hidden" name="vol" value={q.vol} />}
          {q.rtp && <input type="hidden" name="rtp" value={q.rtp} />}
          {q.versions && <input type="hidden" name="versions" value={q.versions} />}
          {q.sort && <input type="hidden" name="sort" value={q.sort} />}
          <button type="submit" style={{ padding: "11px 20px", borderRadius: 10, border: 0, background: "#00C2CC", color: "#04191B", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Search
          </button>
        </form>

        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
          <Link href={href(q, { rtp: undefined, page: 1 })} style={chip(!q.rtp)}>All RTP</Link>
          <Link href={href(q, { rtp: "high", page: 1 })} style={chip(q.rtp === "high")}>96%+</Link>
          <Link href={href(q, { rtp: "mid", page: 1 })} style={chip(q.rtp === "mid")}>94–96%</Link>
          <Link href={href(q, { rtp: "low", page: 1 })} style={chip(q.rtp === "low")}>Under 94%</Link>
          <Link href={href(q, { versions: q.versions === "1" ? undefined : "1", page: 1 })} style={chip(q.versions === "1")}>
            Multiple RTP versions ({t.multiVersion.toLocaleString()})
          </Link>
          <span style={{ width: 12 }} />
          {vols.map((v) => (
            <Link key={v.name} href={href(q, { vol: q.vol === v.name ? undefined : v.name, page: 1 })} style={chip(q.vol === v.name)}>
              {v.name} ({v.count.toLocaleString()})
            </Link>
          ))}
        </div>

        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
          <Link href={href(q, { studio: undefined, page: 1 })} style={chip(!q.studio)}>All studios</Link>
          {studios.slice(0, 14).map((s) => (
            <Link key={s.name} href={href(q, { studio: q.studio === s.name ? undefined : s.name, page: 1 })} style={chip(q.studio === s.name)}>
              {s.name} ({s.count})
            </Link>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
          {/* data-* hooks so an audit can read the result set without matching
              on rendered copy — React splits interpolated text across SSR nodes,
              which made four separate attempts at this measure the wrong number. */}
          <p data-result-total={res.total} data-result-page={res.page} style={{ margin: 0, fontSize: 14, color: "#8DA0AA" }}>
            <strong style={{ color: "#fff" }}>{res.total.toLocaleString()}</strong> {res.total === 1 ? "slot" : "slots"}
            {filtered && res.medianRtp !== null && <> · median RTP <strong style={{ color: "#fff" }}>{res.medianRtp.toFixed(2)}%</strong></>}
            {filtered && <> · <Link href="/slots/database" style={{ color: "#5FE3E8" }}>clear filters</Link></>}
          </p>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {[["rtp", "RTP high"], ["rtp-low", "RTP low"], ["maxwin", "Max win"], ["new", "Newest"], ["name", "A–Z"]].map(([k, label]) => (
              <Link key={k} href={href(q, { sort: k, page: 1 })} style={chip((q.sort ?? "rtp") === k)}>{label}</Link>
            ))}
          </div>
        </div>

        <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,.08)", overflow: "hidden", background: "#0B0F12" }}>
          <div className="hidden md:grid" style={{ gridTemplateColumns: "minmax(200px,2fr) minmax(130px,1fr) 90px 110px 110px 110px", gap: 14, padding: "11px 18px", borderBottom: "1px solid rgba(255,255,255,.07)", fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#8E9CA5" }}>
            <span>Slot</span><span>Studio</span><span>RTP</span><span>Volatility</span><span>Max win</span><span>Released</span>
          </div>
          {res.rows.map((g, i) => (
            <div
              key={`${g.slug ?? g.name}-${i}`}
              className="grid grid-cols-2 md:grid-cols-[minmax(200px,2fr)_minmax(130px,1fr)_90px_110px_110px_110px]"
              style={{ gap: 14, padding: "12px 18px", borderTop: i ? "1px solid rgba(255,255,255,.05)" : undefined, alignItems: "center" }}
            >
              <span style={{ fontSize: 14.5, fontWeight: 700, color: "#E8EDF0", overflowWrap: "anywhere" }}>
                {g.name}
                {g.upcoming && <span style={{ marginLeft: 8, fontFamily: MONO, fontSize: 9, color: "#C7A45C" }}>NOT OUT YET</span>}
              </span>
              <span style={{ fontSize: 13, color: "#8DA0AA", overflowWrap: "anywhere" }}>
                {g.providerSlug ? <Link href={`/providers/${g.providerSlug}`} className="hover:!text-accent" style={{ color: "#9FD9DD" }}>{g.provider}</Link> : g.provider ?? "—"}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 700, color: g.rtp === null ? "#77858E" : g.rtp >= 96 ? "#7BE0B8" : "#E8EDF0" }}>
                {g.rtp === null ? "—" : `${g.rtp.toFixed(2)}%`}
                {/* The spread is the point: an operator may ship any of these
                    and the lobby will not say which. */}
                {g.rtpVariants && g.rtpVariants.length > 1 && (
                  <span style={{ display: "block", fontSize: 10, fontWeight: 400, color: "#C7A45C", whiteSpace: "nowrap" }}>
                    down to {Math.min(...g.rtpVariants).toFixed(2)}%
                  </span>
                )}
              </span>
              <span style={{ fontSize: 13, color: "#A9B8C0" }}>{g.volatility ?? "—"}</span>
              <span style={{ fontFamily: MONO, fontSize: 12.5, color: "#A9B8C0" }}>{g.maxWinMultiplier ? `${g.maxWinMultiplier.toLocaleString()}x` : "—"}</span>
              <span style={{ fontFamily: MONO, fontSize: 12, color: "#8E9CA5" }}>{g.released ?? "—"}</span>
            </div>
          ))}
          {res.rows.length === 0 && (
            <p style={{ margin: 0, padding: "28px 18px", fontSize: 14, color: "#8DA0AA" }}>
              Nothing matches that. <Link href="/slots/database" style={{ color: "#5FE3E8" }}>Clear the filters</Link> and start again.
            </p>
          )}
        </div>

        {res.pages > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            {res.page > 1 && <Link href={href(q, { page: res.page - 1 })} style={chip(false)}>← Previous</Link>}
            <span style={{ fontFamily: MONO, fontSize: 11.5, color: "#8E9CA5" }}>
              Page {res.page.toLocaleString()} of {res.pages.toLocaleString()} · {PER_PAGE} per page
            </span>
            {res.page < res.pages && <Link href={href(q, { page: res.page + 1 })} style={chip(false)}>Next →</Link>}
          </div>
        )}

        <FeaturedPartner context={{ kind: "slots" }} />
        <NextSteps
          steps={[
            { href: "/slots", label: "Slots we've written up", hint: "The titles with a full profile, each cited to the studio's own game page." },
            { href: "/providers", label: "The studios", hint: "Who makes these games, what they licence, and whether they publish every RTP version." },
            { href: "/rtp-watch", label: "RTP Watch", hint: "The one thing no public page discloses: the build an operator actually ships." },
          ]}
        />
      </section>
    </main>
  );
}
