"use client";

import { bonusWithWager } from "@/lib/wager";
import Link from "next/link";
import { useMemo, useState } from "react";
import { siteData } from "@/lib/site-data";
import { payoutView } from "@/lib/payout";

/**
 * Ported from the `isSearch` block in CryptoSlotGuide.dc.html (search
 * for `SEARCH THE INDEX`) plus the real searchGroups logic. Live filter
 * across eight datasets, grouped by type — no debounce needed at this
 * data size, per the README's own note.
 */
export function SearchPage({ initialQuery = "" }: { initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  const { ops, slots, providers, walletRows, exchangeRows, esportsTitles, guideRows } = siteData;

  const query = q.trim().toLowerCase();
  const hit = (s: string) => !query || s.toLowerCase().includes(query);
  // Result groups are listed A–Z, never in a ranked order.
  const byName = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name);

  const groups = useMemo(() => {
    const g = [
      {
        label: "Casinos",
        items: ops
          .filter((o) => hit(o.name) || hit(o.bonus) || hit(o.licence))
          .sort(byName)
          .map((o) => ({ name: o.name, note: `${payoutView(o).kind === "none" ? "" : `${payoutView(o).label} withdrawals · `}${bonusWithWager(o)}`, meta: o.licence, href: o.hasCustomReview ? "/casinos/roobet" : `/casinos/${o.slug}` })),
      },
      {
        label: "Slots",
        items: slots
          .filter((s) => hit(s.name) || hit(s.provider))
          .map((s) => ({ name: s.name, note: `${s.provider} · ${s.vol} volatility`, meta: `${s.rtp.toFixed(2)}%`, href: `/slots/${s.slug}` })),
      },
      {
        label: "Providers",
        items: providers
          .filter((p) => hit(p.name) || hit(p.note))
          .sort(byName)
          .map((p) => ({ name: p.name, note: `${p.rtp} · ${p.licences}`, meta: p.titlesStated ?? "", href: `/providers/${p.slug}` })),
      },
      {
        label: "Wallets",
        items: walletRows
          .filter((w) => hit(w.name) || hit(w.note))
          .sort(byName)
          .map((w) => ({ name: w.name, note: `${w.m1} · ${w.m2}`, meta: /not stated/i.test(w.m3) ? "" : `${w.m3} swap fee`, href: `/wallets/${w.slug}` })),
      },
      {
        label: "Exchanges",
        items: exchangeRows
          .filter((x) => hit(x.name) || hit(x.note))
          .sort(byName)
          .map((x) => ({ name: x.name, note: `${x.m1} taker fee · ${x.m2}`, meta: x.m3, href: `/exchanges/${x.slug}` })),
      },
      {
        label: "Markets",
        items: esportsTitles
          .filter((m) => hit(m.name) || hit(m.note))
          .map((m) => ({ name: m.name, note: m.note, meta: "Esports", href: `/betting/${m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}` })),
      },
      {
        label: "Guides",
        items: guideRows
          .filter((r) => hit(r.title) || hit(r.standfirst))
          .map((r) => ({ name: r.title, note: `${r.category} · ${r.readMins} min read`, meta: `${r.updated}`, href: `/guides/${r.slug}` })),
      },
    ];
    return g.filter((grp) => grp.items.length);
  }, [query, ops, slots, providers, walletRows, exchangeRows, esportsTitles, guideRows]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const suggestions = ["no-KYC", "Lightning", "Hacksaw", "wagering", "Solana", "esports"];

  return (
    <main>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "#090C0F" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "52px 40px 40px" }}>
          <h1 style={{ margin: "0 0 20px", fontSize: 34, lineHeight: 1.06, letterSpacing: "-.03em", fontWeight: 800, fontStretch: "114%", color: "#fff" }}>
            Search the index
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 8px 8px 18px", borderRadius: 11, background: "#0E1215", border: "1px solid rgba(255,255,255,.12)", boxShadow: "0 14px 40px rgba(0,0,0,.4)" }}>
            <span style={{ color: "#77858E", fontFamily: "var(--font-jetbrains-mono), monospace" }}>⌕</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Operator, slot, studio, wallet, coin or term"
              style={{ flex: 1, border: 0, background: "transparent", color: "#E8EDF0", fontFamily: "var(--font-archivo), sans-serif", fontSize: 15.5, outline: "none", padding: "8px 0" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
            <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#77858E" }}>Try</span>
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQ(s)}
                style={{ padding: "7px 13px", borderRadius: 100, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.02)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#A8B6BE" }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 40px 84px" }}>
        {groups.length > 0 ? (
          <>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "#83919A", marginBottom: 20 }}>
              {total} result{total === 1 ? "" : "s"} {query && `for "${q}"`}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {groups.map((grp) => (
                <div key={grp.label}>
                  <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 10 }}>{grp.label}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 1, border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, overflow: "hidden", background: "rgba(255,255,255,.06)" }}>
                    {grp.items.map((it) => (
                      <Link key={it.href} href={it.href} className="hover:!bg-[#0F1417]" style={{ display: "flex", alignItems: "center", gap: 16, padding: "15px 18px", background: "#0C1013" }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 14.5, fontWeight: 600, color: "#E8EDF0" }}>{it.name}</div>
                          <div style={{ fontSize: 12.5, color: "#7B8A93", marginTop: 2 }}>{it.note}</div>
                        </div>
                        <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5, color: "#8DA0AA", whiteSpace: "nowrap" }}>{it.meta}</span>
                        <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", color: "#00C2CC" }}>→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ padding: 40, borderRadius: 14, background: "#0C1013", border: "1px dashed rgba(255,255,255,.14)", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#DCE5E9", marginBottom: 6 }}>Nothing matched that</div>
            <div style={{ fontSize: 14, color: "#7B8A93" }}>We index operators, slots, studios, wallets, exchanges, markets and guides. Try one of the terms above.</div>
          </div>
        )}
      </section>
    </main>
  );
}
