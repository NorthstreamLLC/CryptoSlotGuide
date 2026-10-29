"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Shows `children` until a moment, then `after`. Static pages are built once
 * per deploy, so a server-side date check would keep showing an expired
 * promotion until the next deploy; this checks in the reader's browser,
 * and flips on time if the page is open across the deadline.
 */
export function Until({ until, children, after = null }: { until: number; children: ReactNode; after?: ReactNode }) {
  const [over, setOver] = useState(false);
  useEffect(() => {
    const left = until - Date.now();
    if (left <= 0) {
      const t = setTimeout(() => setOver(true), 0);
      return () => clearTimeout(t);
    }
    // setTimeout caps at about 24.8 days; past that, the next page load decides.
    if (left > 2 ** 31 - 1) return;
    const t = setTimeout(() => setOver(true), left);
    return () => clearTimeout(t);
  }, [until]);
  return <>{over ? after : children}</>;
}

/** The current time once mounted (null on the server and first paint), refreshed at `at` if given. */
export function useNowAfterMount(at?: number): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const t0 = setTimeout(() => setNow(Date.now()), 0);
    const left = at ? at - Date.now() : -1;
    const t1 = left > 0 && left < 2 ** 31 - 1 ? setTimeout(() => setNow(Date.now()), left) : undefined;
    return () => {
      clearTimeout(t0);
      if (t1) clearTimeout(t1);
    };
  }, [at]);
  return now;
}
