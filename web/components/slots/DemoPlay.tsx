"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { track } from "@vercel/analytics";

/**
 * "Play the free demo": a play button laid over a slot's art that opens the
 * studio's own demo player in a full-screen panel on our page. Play money
 * only. The game loads only when the reader asks for it, so the page stays
 * light and crawlers never fetch the game.
 */
export function DemoPlay({ url, name, studio, slug, variant = "overlay", label }: { url: string; name: string; studio: string; slug: string; variant?: "overlay" | "art" | "primary" | "button" | "chip"; label?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const start = () => {
    setOpen(true);
    try {
      track("demo_play", { slug, from: location.pathname });
    } catch {
      /* analytics off */
    }
  };

  return (
    <>
      <style>{CSS}</style>
      {variant === "overlay" ? (
        <button type="button" className="dp-over" onClick={start} aria-label={`Play the free ${name} demo`}>
          <span className="dp-disc" aria-hidden>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></svg>
          </span>
          <span className="dp-label">Play free demo</span>
        </button>
      ) : variant === "art" ? (
        // The art itself is the button: clean at rest, a soft play icon on hover.
        <button type="button" className="dp-art" onClick={start} aria-label={`Play the free ${name} demo`}>
          <span className="dp-art-icon" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></svg>
          </span>
        </button>
      ) : variant === "primary" ? (
        <button type="button" className="dp-primary" onClick={start}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></svg>
          {label ?? "Play free demo"}
        </button>
      ) : variant === "chip" ? (
        <button type="button" className="dp-chip" onClick={start} aria-label={`Play the free ${name} demo`}>▶ Demo</button>
      ) : (
        <button type="button" className="dp-btn" onClick={start}>▶ Play free demo</button>
      )}
      {open && createPortal(
        <div className="dp-modal" role="dialog" aria-modal="true" aria-label={`${name} free demo`} onClick={() => setOpen(false)}>
          <div className="dp-panel" onClick={(e) => e.stopPropagation()}>
            <div className="dp-bar">
              <span>
                <b>{name}</b> · free demo from {studio} · play money only
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <a href={url} target="_blank" rel="noopener" className="dp-tab">Open in a new tab ↗</a>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close the demo" className="dp-x">×</button>
              </span>
            </div>
            <iframe src={url} title={`${name} demo`} allow="autoplay; fullscreen" allowFullScreen className="dp-frame" />
          </div>
          <style>{CSS}</style>
        </div>,
        document.body
      )}
    </>
  );
}

const CSS = `
.dp-over { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; border: 0; padding: 0; background: transparent; cursor: pointer; color: #0A0D0F; }
.dp-disc { display: flex; align-items: center; justify-content: center; width: 68px; height: 68px; border-radius: 50%; background: #FFC531; box-shadow: 0 0 0 8px rgba(255,197,49,.22), 0 14px 34px rgba(0,0,0,.5); transition: transform .2s ease, box-shadow .2s ease; padding-left: 4px; }
.dp-over:hover .dp-disc { transform: scale(1.08); box-shadow: 0 0 0 12px rgba(255,197,49,.25), 0 14px 34px rgba(0,0,0,.5); }
.dp-label { padding: 5px 12px; border-radius: 100px; background: rgba(7,9,11,.78); border: 1px solid rgba(255,255,255,.16); font-size: 13px; font-weight: 700; color: #fff; backdrop-filter: blur(6px); }
.dp-art { position: absolute; inset: 0; z-index: 2; display: flex; align-items: center; justify-content: center; border: 0; padding: 0; background: transparent; cursor: pointer; }
.dp-art-icon { display: flex; align-items: center; justify-content: center; width: 56px; height: 56px; padding-left: 3px; border-radius: 50%; color: #fff; background: rgba(7,9,11,.55); border: 1px solid rgba(255,255,255,.35); backdrop-filter: blur(8px); opacity: 0; transform: scale(.9); transition: opacity .2s ease, transform .2s ease; }
.dp-art:hover .dp-art-icon, .dp-art:focus-visible .dp-art-icon { opacity: 1; transform: scale(1); }
.dp-art:focus-visible { outline: 2px solid #FFC531; outline-offset: -2px; border-radius: inherit; }
@media (hover: none) { .dp-art-icon { display: none; } }
.dp-primary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; border: 0; border-radius: 11px; background: #FFC531; color: #141007; font-size: 15px; font-weight: 700; cursor: pointer; transition: transform .15s, background .15s; }
.dp-primary:hover { transform: translateY(-1px); background: #FFD45E; }
.dp-btn { display: inline-flex; align-items: center; justify-content: center; padding: 12px 16px; border-radius: 11px; border: 1px solid rgba(255,197,49,.45); background: rgba(255,197,49,.1); color: #FFC531; font-size: 14px; font-weight: 700; cursor: pointer; }
.dp-chip { flex: none; padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(255,197,49,.45); background: rgba(255,197,49,.1); color: #FFC531; font-size: 11.5px; font-weight: 700; cursor: pointer; white-space: nowrap; }
.dp-chip:hover { background: #FFC531; color: #141007; }
.dp-modal { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(3,5,6,.86); backdrop-filter: blur(4px); }
.dp-panel { display: flex; flex-direction: column; width: min(1200px, 100%); height: min(760px, 100%); border-radius: 16px; overflow: hidden; background: #000; border: 1px solid rgba(255,255,255,.14); box-shadow: 0 30px 90px rgba(0,0,0,.6); }
.dp-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; background: #0D1114; font-size: 13px; color: #A9B8C0; }
.dp-bar b { color: #F2F5F7; }
.dp-x { width: 32px; height: 32px; border-radius: 8px; border: 1px solid rgba(255,255,255,.16); background: transparent; color: #E8EDF0; font-size: 20px; line-height: 1; cursor: pointer; }
.dp-tab { font-size: 12.5px; font-weight: 600; color: #C9D3D8; white-space: nowrap; }
.dp-tab:hover { color: #fff; }
.dp-frame { flex: 1; width: 100%; border: 0; background: #000; }
@media (max-width: 640px) { .dp-chip { flex: none; padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(255,197,49,.45); background: rgba(255,197,49,.1); color: #FFC531; font-size: 11.5px; font-weight: 700; cursor: pointer; white-space: nowrap; }
.dp-chip:hover { background: #FFC531; color: #141007; }
.dp-modal { padding: 0; } .dp-panel { border-radius: 0; height: 100%; } }
`;
