"use client";

import { useEffect, useState } from "react";


/**
 * The phone-only claim bar on a report. A report runs several thousand
 * pixels, and on a phone the hero button scrolls away in the first screen,
 * so the offer comes back as a bar once the reader is past the hero — and
 * only then, so it never covers the button it is repeating.
 */
export function StickyOffer({ name, href, offer, note, code }: { name: string; href: string; offer: string; note?: string; /** No longer drawn: the button is gold sitewide. */ brand?: string; code?: string }) {
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
        <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: "#F2F5F7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{offer}</span>
        <span style={{ display: "block", fontSize: 12, color: "#8E9CA4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name}
          {code ? ` · Code ${code}` : note ? ` · ${note}` : ""}
        </span>
      </span>
      <a
        href={href}
        target="_blank"
        rel="nofollow sponsored noopener"
        tabIndex={show ? 0 : -1}
        data-copy-code={code}
        style={{ flex: "none", padding: "12px 18px", borderRadius: 10, background: "#FFC531", color: "#141007", fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}
      >
        Claim offer
      </a>
    </div>
  );
}
