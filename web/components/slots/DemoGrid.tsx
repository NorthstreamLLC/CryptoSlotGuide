"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DemoPlay } from "@/components/slots/DemoPlay";

export interface DemoTile {
  slug: string;
  name: string;
  studio: string;
  url: string;
  art: string | null;
  rtp: string;
  vol: string;
  maxWin: string;
  /** Our page for the title, where we have one. */
  page: string | null;
}

const num = (s: string) => Number(s.replace(/[^\d.]/g, "")) || 0;
const SORTS = {
  az: { label: "A–Z", fn: (a: DemoTile, b: DemoTile) => a.name.localeCompare(b.name) },
  rtp: { label: "Highest RTP", fn: (a: DemoTile, b: DemoTile) => num(b.rtp) - num(a.rtp) },
  max: { label: "Biggest max win", fn: (a: DemoTile, b: DemoTile) => num(b.maxWin) - num(a.maxWin) },
} as const;

/** Every free demo we can launch, searchable, each playable in place. */
export function DemoGrid({ tiles }: { tiles: DemoTile[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<keyof typeof SORTS>("az");
  const shown = useMemo(() => {
    const k = q.trim().toLowerCase();
    return tiles.filter((t) => !k || t.name.toLowerCase().includes(k)).sort(SORTS[sort].fn);
  }, [tiles, q, sort]);

  return (
    <div>
      <style>{CSS}</style>
      <div className="dg-bar">
        <input className="dg-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${tiles.length} free demos`} aria-label="Search the free demos" />
        <div className="dg-sorts" role="group" aria-label="Sort">
          {(Object.keys(SORTS) as (keyof typeof SORTS)[]).map((s) => (
            <button key={s} type="button" aria-pressed={sort === s} onClick={() => setSort(s)} className="dg-sort">{SORTS[s].label}</button>
          ))}
        </div>
      </div>
      {shown.length === 0 && <p className="dg-none">No demo matches &ldquo;{q}&rdquo;.</p>}
      <div className="dg-grid">
        {shown.map((t) => (
          <div key={t.slug} className="dg-tile">
            <div className="dg-art">
              {t.art ? (
                // eslint-disable-next-line @next/next/no-img-element -- catalogue art, sized by the card
                <img src={t.art} alt={`${t.name} game art`} width={480} height={300} loading="lazy" decoding="async" />
              ) : (
                <span className="dg-noart">{t.name}</span>
              )}
              <DemoPlay url={t.url} name={t.name} studio={t.studio} slug={t.slug} />
            </div>
            <div className="dg-body">
              <b>{t.name}</b>
              <span className="dg-facts">
                {t.rtp && <span>RTP {t.rtp}</span>}
                {t.maxWin && <span>{t.maxWin}</span>}
                {t.vol && <span>{t.vol}</span>}
              </span>
              {t.page && <Link href={t.page} className="dg-link">RTP and specs →</Link>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const CSS = `
.dg-bar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 18px; }
.dg-q { flex: 1 1 260px; min-width: 0; padding: 12px 14px; border-radius: 11px; border: 1px solid rgba(255,255,255,.12); background: #0C1013; color: #F2F5F7; font-size: 15px; }
.dg-q:focus { outline: none; border-color: #FFC531; }
.dg-sorts { display: flex; gap: 6px; flex-wrap: wrap; }
.dg-sort { padding: 9px 12px; border-radius: 100px; border: 1px solid rgba(255,255,255,.12); background: transparent; color: #C9D3D8; font-size: 13px; font-weight: 600; cursor: pointer; }
.dg-sort[aria-pressed="true"] { background: #FFC531; border-color: #FFC531; color: #141007; }
.dg-none { color: #8E9CA4; }
.dg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr)); gap: 14px; }
.dg-tile { display: flex; flex-direction: column; border-radius: 14px; overflow: hidden; background: #0C1013; border: 1px solid rgba(255,255,255,.08); transition: border-color .15s, transform .15s; }
.dg-tile:hover { border-color: rgba(255,197,49,.4); transform: translateY(-2px); }
.dg-art { position: relative; aspect-ratio: 16 / 10; overflow: hidden; background: #11171B; }
.dg-art img { position: absolute; inset: 0; display: block; width: 100% !important; height: 100% !important; max-width: none; object-fit: cover; }
.dg-noart { display: flex; align-items: center; justify-content: center; height: 100%; padding: 12px; text-align: center; font-weight: 700; color: #A9B8C0; }
.dg-art .dp-disc { width: 52px; height: 52px; opacity: .92; }
.dg-art .dp-label { display: none; }
.dg-tile:hover .dp-label { display: inline-block; }
.dg-body { display: flex; flex-direction: column; gap: 5px; padding: 12px 14px 14px; }
.dg-body b { font-size: 15px; color: #F2F5F7; }
.dg-facts { display: flex; flex-wrap: wrap; gap: 4px 10px; font-size: 12.5px; color: #8E9CA4; }
.dg-link { margin-top: 2px; font-size: 13px; font-weight: 600; color: #5FE3E8; }
@media (max-width: 560px) {
  .dg-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .dg-body { padding: 10px 11px 12px; }
  .dg-body b { font-size: 14px; }
  .dg-facts { font-size: 11.5px; }
  .dg-art .dp-disc { width: 42px; height: 42px; }
  .dg-art .dp-disc svg { width: 20px; height: 20px; }
}
`;
