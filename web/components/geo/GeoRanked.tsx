"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import { getGeo } from "@/lib/geo-client";

/**
 * A ranked list of casino placements, cut to `count` after dropping the ones
 * that turn this visitor away (restricted country, or a region such as
 * Ontario, via /api/geo). The server sends a few spare candidates so a blocked
 * one is replaced by the next fit rather than leaving a gap. Crawlers and first
 * paint get the top `count`. Where every candidate is blocked, `fallback`.
 */
export function GeoRanked({ items, count, fallback = null }: { items: { slug: string; node: ReactNode }[]; count: number; fallback?: ReactNode }) {
  const [blocked, setBlocked] = useState<string[] | null>(null);

  useEffect(() => {
    let live = true;
    getGeo().then((g) => {
      if (!live || !g?.detected) return;
      const out = new Set([...(g.casinos?.restrictedSlugs ?? []), ...(g.regionBlocked ?? []).map((r) => r.slug)]);
      if (items.some((i) => out.has(i.slug))) setBlocked([...out]);
    });
    return () => {
      live = false;
    };
  }, [items]);

  const shown = (blocked ? items.filter((i) => !blocked.includes(i.slug)) : items).slice(0, count);
  if (!shown.length) return <>{fallback}</>;
  return <>{shown.map((i) => <Fragment key={i.slug}>{i.node}</Fragment>)}</>;
}

