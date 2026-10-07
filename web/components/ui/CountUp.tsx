"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A figure that counts up from zero the first time it scrolls into view.
 * The server renders the final value, so it reads correctly without
 * JavaScript and to search engines; the count only runs in the browser, and
 * not at all for anyone who has asked for reduced motion.
 */
export function CountUp({ value, prefix = "", suffix = "", ms = 1400 }: { value: number; prefix?: string; suffix?: string; ms?: number }) {
  const [shown, setShown] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / ms);
          setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        setShown(0);
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, ms]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>
      {prefix}
      {shown.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
