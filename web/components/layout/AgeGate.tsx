"use client";

import { useEffect, useState } from "react";

const KEY = "csg-age-ok";

/**
 * The 18+ confirmation, once per browser. A gambling site asks before the
 * first page is read: "Yes, I'm 18 or older" closes it and is remembered;
 * "No" sends the reader to a gambling-support page instead.
 *
 * It renders nothing on the server and nothing until the browser has checked
 * storage, so the page HTML is unchanged (search engines read the same page;
 * age gates are one of the interstitials Google treats as legitimate), and a
 * returning reader never sees it flash. Where storage is blocked it asks once
 * per visit rather than locking anyone out.
 */
export function AgeGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let ok = false;
    try {
      ok = localStorage.getItem(KEY) === "1";
    } catch {
      try {
        ok = sessionStorage.getItem(KEY) === "1";
      } catch {
        /* both blocked: ask on each page view */
      }
    }
    if (!ok) setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const yes = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* storage blocked: closes for this page view only */
      }
    }
    setOpen(false);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="age-gate-title" style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 18, background: "rgba(5,7,9,.82)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
      <div style={{ width: "100%", maxWidth: 440, padding: "30px 28px 24px", borderRadius: 20, background: "radial-gradient(120% 100% at 100% 0%, rgba(0,194,204,.14), transparent 55%), #0E1317", border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 30px 80px rgba(0,0,0,.6)", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, margin: "0 auto 16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #00C2CC", fontSize: 22, fontWeight: 800, color: "#fff" }}>18+</div>
        <h2 id="age-gate-title" style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>Are you 18 or older?</h2>
        <p style={{ margin: "0 0 22px", fontSize: 14, lineHeight: 1.6, color: "#A8B6BE" }}>
          CryptoSlotGuide covers gambling and links to casinos. You must be 18 or older, and of legal gambling age where you live, to use it.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <button type="button" onClick={yes} autoFocus style={{ flex: "1 1 180px", padding: "13px 18px", borderRadius: 11, border: 0, background: "#00C2CC", color: "#04191B", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
            Yes, I&apos;m 18 or older
          </button>
          <a href="https://www.begambleaware.org/" rel="noopener noreferrer" style={{ flex: "1 1 120px", padding: "13px 18px", borderRadius: 11, border: "1px solid rgba(255,255,255,.16)", color: "#DCE5E9", fontSize: 15, fontWeight: 700 }}>
            No
          </a>
        </div>
        <p style={{ margin: "18px 0 0", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, lineHeight: 1.6, color: "#77858E" }}>
          Gamble responsibly · <a href="https://www.begambleaware.org/" target="_blank" rel="noopener noreferrer" style={{ color: "#8DA0AA", textDecoration: "underline" }}>BeGambleAware.org</a>
        </p>
      </div>
    </div>
  );
}
