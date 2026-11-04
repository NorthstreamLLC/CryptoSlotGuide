import Link from "next/link";
import type { topSlotRows } from "@/lib/slot-page";

type Row = ReturnType<typeof topSlotRows>[number];

/**
 * Slot tiles: the game's art, its name, studio and published RTP. Flat, no
 * badges or chips; a small rank sits on the art where the list is ranked.
 * Same look as the homepage's top slots.
 */
const CSS = `
.sa-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; min-width: 0; }
.sa-card { display: block; min-width: 0; }
.sa-art { position: relative; display: block; aspect-ratio: 16 / 10; border-radius: 12px; overflow: hidden; background: #11161A; border: 1px solid rgba(255,255,255,.06); }
.sa-art img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .4s ease; }
.sa-card:hover .sa-art img { transform: scale(1.03); }
.sa-rank { position: absolute; top: 8px; left: 8px; padding: 2px 7px; border-radius: 6px; background: rgba(8,11,13,.8); font-size: 12px; font-weight: 700; color: #F2F5F7; }
.sa-card b { display: block; margin-top: 12px; font-size: 15px; font-weight: 600; color: #EEF2F4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sa-card:hover b { color: #fff; }
.sa-card small { display: block; margin-top: 2px; font-size: 13px; color: #75828A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sa-card small em { font-style: normal; color: #57E39A; }
@media (max-width: 960px) { .sa-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; } }
`;

export function SlotArtCards({ rows, showRank = true }: { rows: Row[]; showRank?: boolean }) {
  return (
    <>
      <style>{CSS}</style>
      <div className="sa-grid">
        {rows.map((r) => (
          <Link key={r.slug} href={`/slots/${r.slug}`} className="sa-card">
            <span className="sa-art">
              {r.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.image} alt={r.name} width={320} height={200} loading="lazy" decoding="async" />
              )}
              {showRank && <span className="sa-rank">{r.rank}</span>}
            </span>
            <b>{r.name}</b>
            <small>
              {r.provider} · <em>{r.rtp}</em> RTP · {r.maxWin} max
            </small>
          </Link>
        ))}
      </div>
    </>
  );
}
