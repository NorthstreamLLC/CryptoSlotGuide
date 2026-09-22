"use client";

import { useEffect, useState } from "react";

const MONO = "var(--font-jetbrains-mono), monospace";

/**
 * The phone-only claim bar on a report. A report runs several thousand
 * pixels, and on a phone the hero button scrolls away in the first screen,
 * so the offer comes back as a bar once the reader is past the hero — and
 * only then, so it never covers the button it is repeating.
 */
export function StickyOffer({ name, href, offer, note, brand }: { name: string; href: string; offer: string; note?: string; brand: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 620);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="csg-mobile-only"
      aria-hidden={!show}
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        alignItems: "center",
        gap: 12,
        padding: "10px 14px calc(10px + env(safe-area-inset-bottom))",
        background: "rgba(9,12,15,.94)",
        backdropFilter: "blur(14px)",
        borderTop: "1px solid rgba(255,255,255,.1)",
        transform: show ? "translateY(0)" : "translateY(110%)",
        transition: "transform .22s ease",
        pointerEvents: show ? "auto" : "none",
      }}
    >
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: "block", fontSize: 13.5, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{offer}</span>
        <span style={{ display: "block", fontFamily: MONO, fontSize: 10, color: "#6E7F88", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name}
          {note ? ` · ${note}` : ""}
        </span>
      </span>
      <a
        href={href}
        target="_blank"
        rel="nofollow sponsored noopener"
        tabIndex={show ? 0 : -1}
        style={{ flex: "none", padding: "12px 18px", borderRadius: 10, background: brand, color: "#0A0D0F", fontSize: 14, fontWeight: 800, whiteSpace: "nowrap" }}
      >
        Claim offer
      </a>
    </div>
  );
}
