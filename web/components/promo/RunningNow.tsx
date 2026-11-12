"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getGeo } from "@/lib/geo-client";

/**
 * The homepage's "Running now" promotions. Each is hidden where its casino
 * turns the visitor away (its restricted countries, or a region it names such
 * as Ontario, via /api/geo); when none are left the block disappears rather
 * than showing an empty heading. Crawlers and first paint get every item.
 */
export function RunningNow({ items }: { items: { slug: string; node: ReactNode }[] }) {
  const [blocked, setBlocked] = useState<Set<string>>(new Set());

  useEffect(() => {
    let live = true;
    getGeo().then((g) => {
      if (!live || !g?.detected) return;
      setBlocked(new Set([...(g.casinos?.restrictedSlugs ?? []), ...(g.regionBlocked ?? []).map((r) => r.slug)]));
    });
    return () => {
      live = false;
    };
  }, []);

  const shown = items.filter((i) => !blocked.has(i.slug));
  if (!shown.length) return null;
  return (
    <div className="h-running">
      <span className="h-running-label">Running now</span>
      <div className="h-running-list">
        {shown.map((i) => (
          <div key={i.slug}>{i.node}</div>
        ))}
      </div>
    </div>
  );
}
