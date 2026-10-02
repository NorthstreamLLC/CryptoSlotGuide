"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A number that counts up to its value the first time it is seen. Takes the
 * final figure as a string so the formatting ("8,721", "96.10%", "$1.2M")
 * stays exactly what the page already prints: the digits animate, the rest
 * of the string is left alone. Renders the final value on the server and
 * under reduced motion, so the number is never missing from the markup.
 */
export function CountUp({ value, duration = 900 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const m = value.match(/^(.*?)([\d,]+(?:\.\d+)?)(.*)$/);
    if (!m || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const [, pre, num, post] = m;
    const target = Number(num.replace(/,/g, ""));
    const decimals = (num.split(".")[1] ?? "").length;
    const grouped = num.includes(",");
    const fmt = (n: number) => (grouped ? n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : n.toFixed(decimals));
    let raf = 0;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setShown(`${pre}${fmt(target * eased)}${post}`);
        if (p < 1) raf = requestAnimationFrame(tick);
        else setShown(value);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, duration]);
  return <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>{shown}</span>;
}
