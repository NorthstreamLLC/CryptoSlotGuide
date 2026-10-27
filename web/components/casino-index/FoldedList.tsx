"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A <details> fold whose contents stay in the HTML (so a crawler reads every
 * row), opened when the page is reached at one of `hashes` or a link to one is
 * clicked: "See all 46 with filters" and old links to #all-casinos land open.
 */
export function FoldedList({ summary, hashes, children }: { summary: ReactNode; hashes: string[]; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const open = () => {
      if (ref.current && hashes.includes(window.location.hash.slice(1))) {
        ref.current.open = true;
        document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
      }
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, [hashes]);

  return (
    <details ref={ref} id={hashes[0]} className="csg-fold" style={{ scrollMarginTop: 100 }}>
      <summary
        style={{ listStyle: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 20px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(0,194,204,.35)", color: "#00C2CC", fontSize: 15.5, fontWeight: 800 }}
      >
        {summary}
      </summary>
      <style>{`.csg-fold summary::-webkit-details-marker{display:none}.csg-fold[open] summary{margin-bottom:8px}`}</style>
      {children}
    </details>
  );
}
