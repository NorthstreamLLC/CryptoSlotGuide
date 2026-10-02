"use client";

import { useEffect } from "react";

/**
 * Scroll reveal for the whole site, from one observer.
 *
 * Anything marked data-reveal starts a few pixels low and transparent (see
 * globals.css) and gets data-in the first time it enters the viewport, which
 * the CSS turns into a short rise.
 *
 * Three layers, because each one alone has a hole:
 *
 *   1. On every scan, anything whose box is already inside the viewport is
 *      marked synchronously — no observer, no frame. The first paint is
 *      right even if nothing else below ever runs.
 *   2. An IntersectionObserver marks the rest as they scroll in.
 *   3. A throttled scroll listener does the same from boxes alone, for the
 *      cases where an observer is never called back — a document that is
 *      not painting (a background tab, an embedded pane), where IO callbacks
 *      are not delivered and requestAnimationFrame does not run. setTimeout
 *      still does, so the throttle uses that.
 *
 * It watches the document rather than scanning once: a long page streams
 * its body in after the layout has hydrated, and client navigation swaps
 * the DOM, so a MutationObserver hands every new element to the scan.
 *
 * Under prefers-reduced-motion the CSS has flattened the transition;
 * marking everything in at once is the correct no-motion result.
 */
const SELECTOR = "[data-reveal]:not([data-in])";

function inViewport(el: Element): boolean {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return r.bottom > 0 && r.top < vh * 0.96 && r.right > 0 && r.left < window.innerWidth;
}

export function RevealObserver() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      const all = () => document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => el.setAttribute("data-in", ""));
      all();
      const mo = new MutationObserver(all);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-in", "");
          io.unobserve(e.target);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -4% 0px" }
    );
    const observed = new WeakSet<Element>();

    const scan = () => {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (inViewport(el)) {
          el.setAttribute("data-in", "");
          return;
        }
        if (!observed.has(el)) {
          observed.add(el);
          io.observe(el);
        }
      });
    };

    scan();
    let pending: number | null = null;
    const throttled = () => {
      if (pending !== null) return;
      pending = window.setTimeout(() => {
        pending = null;
        scan();
      }, 60);
    };
    window.addEventListener("scroll", throttled, { passive: true });
    window.addEventListener("resize", throttled);
    const mo = new MutationObserver(throttled);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", throttled);
      window.removeEventListener("resize", throttled);
      mo.disconnect();
      io.disconnect();
      if (pending !== null) window.clearTimeout(pending);
    };
  }, []);
  return null;
}
