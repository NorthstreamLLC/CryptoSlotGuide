"use client";

import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";

/**
 * Copies a casino's referral code for the reader, site-wide, from one listener.
 *
 * Any element carrying data-copy-code — the code chips (CodeChip) and every
 * "Visit"/"Claim" button of a casino that has a code — copies that code when
 * clicked, and a toast says so. On a phone the code otherwise has to be
 * remembered across a tab switch and typed into a sign-up form, which is
 * where it gets lost. A button still opens the casino as before: nothing here
 * prevents the click; a chip is a <button> and goes nowhere.
 *
 * One listener in the layout rather than a client component per button, so
 * the server-rendered lists stay server-rendered. The same listener counts
 * clicks on casino review links (review_click) as a demand signal.
 */
export function CodeCopier() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onClick = (e: MouseEvent) => {
      // Demand signal: which casino reviews readers open, and from where.
      // With /go/'s affiliate_click this shows the casinos people want that
      // carry no deal yet. Slug and page only — nothing about the reader.
      const review = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="/casinos/"]');
      if (review) {
        const slug = review.getAttribute("href")!.split(/[/?#]/)[2];
        if (slug) {
          try {
            track("review_click", { slug, from: location.pathname });
          } catch {
            /* analytics off */
          }
        }
      }
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-copy-code]");
      const code = el?.dataset.copyCode;
      if (!code) return;
      const done = () => {
        setToast(code);
        clearTimeout(timer);
        timer = setTimeout(() => setToast(null), 3200);
      };
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(code).then(done, () => fallback(code) && done());
      else if (fallback(code)) done();
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 84,
        zIndex: 60,
        transform: `translate(-50%, ${toast ? "0" : "16px"})`,
        opacity: toast ? 1 : 0,
        pointerEvents: "none",
        transition: "opacity .18s ease, transform .18s ease",
        padding: "11px 16px",
        borderRadius: 12,
        background: "#111A1E",
        border: "1px solid rgba(87,227,154,.45)",
        boxShadow: "0 12px 34px rgba(0,0,0,.45)",
        color: "#E8EDF0",
        fontSize: 13.5,
        whiteSpace: "nowrap",
      }}
    >
      {toast ? (
        <>
          <span style={{ color: "#57E39A", fontWeight: 800 }}>✓</span> Code{" "}
          <strong style={{ fontFamily: "var(--font-jetbrains-mono), monospace", color: "#57E39A" }}>{toast}</strong> copied — paste it when you sign up
        </>
      ) : null}
    </div>
  );
}

/** For browsers without the async clipboard (older iOS in-app browsers). */
function fallback(text: string): boolean {
  try {
    const t = document.createElement("textarea");
    t.value = text;
    t.setAttribute("readonly", "");
    t.style.position = "fixed";
    t.style.opacity = "0";
    document.body.appendChild(t);
    t.select();
    const ok = document.execCommand("copy");
    t.remove();
    return ok;
  } catch {
    return false;
  }
}
