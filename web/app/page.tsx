import Link from "next/link";
import ops from "@/data/ops.json";
import slots from "@/data/slots.json";
import liveCasinos from "@/data/liveCasinos.json";
import tickerFacts from "@/data/tickerFacts.json";
import type { LiveCasino, Operator, Slot } from "@/lib/types";
import { counts, topScore } from "@/lib/derived";
import { CasinoIndexTable } from "@/components/home/CasinoIndexTable";

const operators = ops as Operator[];
const slotList = slots as Slot[];
const liveList = liveCasinos as LiveCasino[];
const facts = tickerFacts as { text: string }[];

export default function HomePage() {
  const stats = counts(operators, slotList, liveList);
  const topPick = topScore(operators);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-section">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-32 h-96 w-96 rounded-full bg-accent/20 blur-[100px]"
          style={{ animation: "csg-drift 22s ease-in-out infinite" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-accent-gold/10 blur-[100px]"
          style={{ animation: "csg-drift2 26s ease-in-out infinite" }}
        />
        <div className="relative mx-auto max-w-[1400px] px-10 py-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.09em] text-accent">
            Measurement over marketing
          </p>
          <h1 className="mt-3 max-w-3xl text-[44px] font-extrabold leading-[1.05] tracking-[-0.035em] text-text-primary sm:text-[56px]">
            Crypto casino reviews, tested on funded accounts.
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-[1.65] text-text-muted">
            Every score here traces to a figure someone recorded with real money — timed
            withdrawals, in-client RTP checks, no affiliate demo accounts. {stats.casinos}{" "}
            casinos, {stats.slots} slots and {stats.live} live-dealer lobbies tracked so far.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/crypto-casinos"
              className="rounded-btn bg-accent px-5 py-2.5 text-[14px] font-semibold text-page shadow-cta transition-transform hover:scale-[1.02]"
            >
              Browse crypto casinos
            </Link>
            <Link
              href="/rtp-watch"
              className="rounded-btn border border-border-strong px-5 py-2.5 text-[14px] font-semibold text-text-primary transition-colors hover:border-accent hover:text-accent"
            >
              See RTP Watch
            </Link>
          </div>
        </div>

        {/* Results ticker */}
        <div className="relative border-t border-border bg-page/60 py-2.5">
          <div className="flex gap-10 overflow-hidden whitespace-nowrap">
            <div className="flex shrink-0 gap-10 pl-10" style={{ animation: "csg-slide 46s linear infinite" }}>
              {[...facts, ...facts].map((f, i) => (
                <span key={i} className="font-mono text-[12px] text-text-dim">
                  {f.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Top pick */}
      {topPick && (
        <section className="mx-auto max-w-[1400px] px-10 py-12">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.09em] text-accent-gold">
            Top pick
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4 rounded-hero border border-border bg-surface-hero p-6 shadow-hero">
            <div>
              <h2 className="text-[22px] font-bold tracking-[-0.02em] text-text-primary">
                {topPick.name}
              </h2>
              <p className="mt-1 text-[14px] text-text-muted">{topPick.bonus}</p>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <div className="font-mono text-[36px] font-bold tracking-[-0.03em] text-accent-bright">
                  {topPick.score.toFixed(1)}
                </div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.07em] text-text-dim">
                  Score
                </div>
              </div>
              <Link
                href={`/casinos/${topPick.slug}`}
                className="rounded-btn bg-accent px-5 py-2.5 text-[14px] font-semibold text-page"
              >
                Read the review →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Casino index preview */}
      <section className="mx-auto max-w-[1400px] px-10 pb-12">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-[26px] font-extrabold tracking-[-0.028em] text-text-primary">
              Crypto casino index
            </h2>
            <p className="mt-1 text-[15px] text-text-muted">
              Ranked by measured score — click a column to re-sort.
            </p>
          </div>
          <Link href="/crypto-casinos" className="font-mono text-[12.5px] text-accent hover:text-accent-bright">
            See all {stats.casinos} casinos →
          </Link>
        </div>
        <CasinoIndexTable operators={operators} />
      </section>

      {/* Slots preview */}
      <section className="mx-auto max-w-[1400px] px-10 pb-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-[26px] font-extrabold tracking-[-0.028em] text-text-primary">
            Slots &amp; RTP
          </h2>
          <Link href="/slots" className="font-mono text-[12.5px] text-accent hover:text-accent-bright">
            See all {stats.slots} slots →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {slotList.map((s) => (
            <Link
              key={s.slug}
              href={`/slots/${s.slug}`}
              className="rounded-card border border-border bg-surface p-4 shadow-card transition-colors hover:border-border-strong"
            >
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-btn font-mono text-[12px] font-bold"
                style={{ background: `${s.tint}22`, color: s.tint }}
              >
                {s.mono}
              </div>
              <div className="text-[14px] font-semibold text-text-primary">{s.name}</div>
              <div className="mt-0.5 text-[12.5px] text-text-dim">{s.provider}</div>
              <div className="mt-2 font-mono text-[12.5px] text-text-secondary">
                RTP {s.rtp.toFixed(2)}%
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Live casino preview */}
      <section className="mx-auto max-w-[1400px] px-10 pb-16">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-[26px] font-extrabold tracking-[-0.028em] text-text-primary">
            Live casino
          </h2>
          <Link href="/live-casino" className="font-mono text-[12.5px] text-accent hover:text-accent-bright">
            See all live tables →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {liveList.map((c) => (
            <div key={c.slug} className="rounded-card border border-border bg-surface p-4 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-text-primary">{c.name}</span>
                <span
                  className="h-2 w-2 rounded-full bg-accent"
                  style={{ animation: "csg-pulse 2.2s ease-in-out infinite" }}
                  aria-hidden
                />
              </div>
              <p className="mt-2 text-[13px] text-text-muted">{c.note}</p>
              <div className="mt-3 flex gap-4 font-mono text-[12px] text-text-dim">
                <span>{c.tables} tables</span>
                <span>{c.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
