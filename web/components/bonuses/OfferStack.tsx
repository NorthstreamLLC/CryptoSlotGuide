"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getGeo } from "@/lib/geo-client";

/**
 * The bonuses hero: the top offers as a stack of cards, one in front and the
 * others peeking out behind it. Clicking a card behind brings it to the
 * front. Cards for casinos that turn the visitor away (restricted country, or
 * a region such as Ontario) leave the stack; if none is left, `fallback`.
 * Crawlers and first paint get the full stack in the server's order.
 */
export function OfferStack({ items, fallback = null }: { items: { slug: string; name: string; tint: string; face: ReactNode; peek: ReactNode }[]; fallback?: ReactNode }) {
  const [blocked, setBlocked] = useState<string[]>([]);
  const [front, setFront] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    getGeo().then((g) => {
      if (!live || !g?.detected) return;
      const out = [...(g.casinos?.restrictedSlugs ?? []), ...(g.regionBlocked ?? []).map((r) => r.slug)];
      if (items.some((i) => out.includes(i.slug))) setBlocked(out);
    });
    return () => {
      live = false;
    };
  }, [items]);

  const open = items.filter((i) => !blocked.includes(i.slug)).slice(0, 3);
  if (!open.length) return <>{fallback}</>;
  const lead = open.find((i) => i.slug === front) ?? open[0];
  const behind = open.filter((i) => i !== lead).slice(0, 2);

  return (
    <div className="os" style={{ paddingTop: behind.length * 34 }}>
      <style>{CSS}</style>
      {behind
        .slice()
        .reverse()
        .map((i, k, arr) => {
          const depth = arr.length - k; // 2 = furthest back
          return (
            <button
              key={i.slug}
              type="button"
              className="os-back"
              onClick={() => setFront(i.slug)}
              aria-label={`Show the ${i.name} offer`}
              style={{ ["--tint" as string]: i.tint, top: (behind.length - depth) * 34, left: `${depth * 4}%`, right: `${depth * 4}%`, zIndex: 3 - depth }}
            >
              {i.peek}
            </button>
          );
        })}
      <div key={lead.slug} className="os-front" style={{ ["--tint" as string]: lead.tint }}>
        {lead.face}
      </div>
      {open.length > 1 && (
        <div className="os-dots" role="tablist" aria-label="Offers">
          {open.slice(0, 3).map((i) => (
            <button key={i.slug} type="button" role="tab" aria-selected={i === lead} aria-label={i.name} onClick={() => setFront(i.slug)} className="os-dot" style={{ ["--tint" as string]: i.tint }} />
          ))}
        </div>
      )}
    </div>
  );
}

const CSS = `
.os { position: relative; }
.os-back { position: absolute; display: flex; align-items: flex-start; height: 120px; padding: 7px 16px; border-radius: 18px; text-align: left; cursor: pointer;
  background: linear-gradient(135deg, color-mix(in srgb, var(--tint) 22%, #0F1316), #0F1316 70%); border: 1px solid color-mix(in srgb, var(--tint) 40%, transparent);
  box-shadow: 0 10px 30px rgba(0,0,0,.4); transition: transform .2s ease, border-color .2s; }
.os-back:hover { transform: translateY(-4px); border-color: var(--tint); }
.os-front { position: relative; z-index: 3; border-radius: 18px; padding: 24px; animation: os-in .35s ease;
  background: radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--tint) 16%, transparent), transparent 60%), #0F1316;
  border: 1px solid color-mix(in srgb, var(--tint) 45%, transparent);
  box-shadow: 0 30px 80px -24px color-mix(in srgb, var(--tint) 40%, transparent), 0 18px 50px rgba(0,0,0,.5); }
@keyframes os-in { from { opacity: .4; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.os-dots { display: flex; justify-content: center; gap: 8px; margin-top: 14px; }
.os-dot { width: 8px; height: 8px; padding: 0; border-radius: 50%; border: 0; background: rgba(255,255,255,.18); cursor: pointer; }
.os-dot[aria-selected="true"] { width: 22px; border-radius: 4px; background: var(--tint); }
@media (prefers-reduced-motion: reduce) { .os-front { animation: none; } .os-back { transition: none; } }
`;
