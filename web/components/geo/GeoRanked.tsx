"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import { getGeo } from "@/lib/geo-client";

/**
 * A ranked list of casino placements, cut to `count` after dropping the ones
 * that turn this visitor away (restricted country, or a region such as
 * Ontario, via /api/geo). The server sends a few spare candidates so a blocked
 * one is replaced by the next fit rather than leaving a gap. Crawlers and first
 * paint get the top `count`. Where every candidate is blocked, the top `count`
 * stay with `note` after them, as every list on the site does: shown, and the
 * reader told before they click.
 */
export function GeoRanked({ items, count, note = null }: { items: { slug: string; node: ReactNode }[]; count: number; /** Shown after the list when every candidate is shut to the visitor. */ note?: ReactNode }) {
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

  const allowed = blocked ? items.filter((i) => !blocked.includes(i.slug)) : items;
  const allBlocked = !allowed.length;
  const shown = (allBlocked ? items : allowed).slice(0, count);
  return (
    <>
      {shown.map((i) => <Fragment key={i.slug}>{i.node}</Fragment>)}
      {allBlocked && <Fragment key="note">{note}</Fragment>}
    </>
  );
}

