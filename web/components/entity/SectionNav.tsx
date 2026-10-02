"use client";

import { useEffect, useState } from "react";

/**
 * The in-page menu on a review: one pill per section, stuck under the site
 * header, the current section lit. A casino page runs to eight screens —
 * figures, verdict, terms, titles, questions — and a reader who came for the
 * wagering rule should not have to scroll past the rest to find it.
 *
 * Sticks at the header's measured height rather than a guessed one, and
 * lights the section whose heading last crossed the top third of the
 * viewport. Hidden when there are fewer than three sections — a menu of two
 * is noise.
 */
export interface SectionNavItem {
  id: string;
  label: string;
}

const MONO = "var(--font-jetbrains-mono), monospace";

export function SectionNav({ items }: { items: SectionNavItem[] }) {
  const [top, setTop] = useState(64);
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const header = document.querySelector("header");
    const measure = () => setTop(header ? header.getBoundingClientRect().height : 64);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const onScroll = () => {
      const line = window.innerHeight / 3;
      let current = els[0].id;
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id;
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  if (items.length < 3) return null;

  return (
    <nav
      aria-label="On this page"
      style={{
        position: "sticky",
        top,
        zIndex: 20,
        background: "rgba(7,9,11,.86)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "10px 40px", display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
        {items.map((i) => {
          const on = i.id === active;
          return (
            <a
              key={i.id}
              href={`#${i.id}`}
              onClick={(ev) => {
                const el = document.getElementById(i.id);
                if (!el) return;
                ev.preventDefault();
                el.scrollIntoView({ behavior: "smooth", block: "start" });
                history.replaceState(null, "", `#${i.id}`);
              }}
              style={{
                flex: "none",
                padding: "6px 12px",
                borderRadius: 100,
                border: `1px solid ${on ? "rgba(0,194,204,.5)" : "rgba(255,255,255,.1)"}`,
                background: on ? "rgba(0,194,204,.12)" : "transparent",
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: ".04em",
                color: on ? "#5FE3E8" : "#A8B6BE",
                whiteSpace: "nowrap",
                transition: "background .2s, color .2s, border-color .2s",
              }}
            >
              {i.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
