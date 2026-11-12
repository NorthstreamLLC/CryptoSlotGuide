"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getGeo } from "@/lib/geo-client";

/**
 * Shows `children` (a casino's promotion) unless that casino turns the visitor
 * away, by its restricted countries or a region it names such as Ontario (via
 * /api/geo); then shows `fallback` in the same slot. Crawlers and first paint
 * get the promotion.
 */
export function GeoSwap({ slug, children, fallback = null }: { slug: string; children: ReactNode; fallback?: ReactNode }) {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let live = true;
    getGeo().then((g) => {
      if (live && g?.detected && (g.casinos?.restrictedSlugs?.includes(slug) || g.regionBlocked?.some((r) => r.slug === slug))) setBlocked(true);
    });
    return () => {
      live = false;
    };
  }, [slug]);

  return <>{blocked ? fallback : children}</>;
}
