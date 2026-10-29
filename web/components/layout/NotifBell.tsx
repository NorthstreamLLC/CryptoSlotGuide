"use client";

import { useNowAfterMount } from "@/components/ui/Until";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Notif } from "@/lib/notifications";
import { BrandMark } from "@/components/ui/BrandMark";
import { tintFor } from "@/lib/logo";
import { fetchCoinPrices, type CoinPriceMap } from "@/lib/coingecko";

const KEY = "csg-notif-seen";
const MONO = "var(--font-jetbrains-mono), monospace";
const TABS = [
  { key: "all", label: "All" },
  { key: "offer", label: "Offers" },
  { key: "guide", label: "Guides" },
  { key: "review", label: "Reviews" },
  { key: "prices", label: "Prices" },
] as const;
type TabKey = (typeof TABS)[number]["key"];
const PRICE_COINS = ["BTC", "ETH", "SOL", "USDT", "LTC", "DOGE", "XRP", "TRX"];

function readSeen(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function ago(iso?: string): string {
  if (!iso) return "";
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (Number.isNaN(days)) return "";
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

function BellIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

/**
 * The header bell: our pick's standing offer, pinned, then the newest guides
 * and slot reviews, and live coin prices. What a reader has seen is kept in
 * their own browser (localStorage), so the red count is theirs alone; nothing
 * is sent anywhere and there are no push notifications.
 */
export function NotifBell({ items: all }: { items: Notif[] }) {
  // Time-limited items (a promotion) drop out at their deadline, checked in the browser.
  const now = useNowAfterMount(Math.min(...all.map((i) => i.until ?? Infinity)));
  const items = now ? all.filter((i) => !i.until || now < i.until) : all;
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>("all");
  const [seen, setSeen] = useState<Set<string> | null>(null);
  const [prices, setPrices] = useState<CoinPriceMap | null>(null);
  const box = useRef<HTMLDivElement>(null);

  // Read after mount: the server has no storage, and reading during render
  // would make the first paint differ from the server's.
  useEffect(() => {
    const t = setTimeout(() => setSeen(readSeen()), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open || tab !== "prices" || prices) return;
    fetchCoinPrices(PRICE_COINS).then(setPrices).catch(() => setPrices({}));
  }, [open, tab, prices]);

  const unread = seen ? items.filter((i) => !seen.has(i.id)) : [];
  const save = (s: Set<string>) => {
    setSeen(s);
    try {
      localStorage.setItem(KEY, JSON.stringify([...s]));
    } catch {
      /* storage blocked: the count resets next visit */
    }
  };
  const markAll = () => save(new Set(items.map((i) => i.id)));
  const markOne = (id: string) => save(new Set([...(seen ?? []), id]));

  const shown = tab === "all" ? items : items.filter((i) => i.kind === tab);

  return (
    <div ref={box} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unread.length ? `, ${unread.length} new` : ""}`}
        aria-expanded={open}
        style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 34, borderRadius: 8, border: "1px solid rgba(255,255,255,.10)", background: open ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.02)", color: "#C3CFD5", cursor: "pointer" }}
      >
        <BellIcon />
        {unread.length > 0 && (
          <span style={{ position: "absolute", top: -6, right: -6, minWidth: 18, height: 18, padding: "0 5px", borderRadius: 100, background: "#FF4D5E", color: "#fff", fontSize: 10.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 2px #090C0F" }}>
            {unread.length}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          style={{ position: "absolute", top: 46, right: -60, width: "min(400px, calc(100vw - 24px))", maxHeight: "min(620px, calc(100vh - 90px))", display: "flex", flexDirection: "column", borderRadius: 16, background: "#0E1317", border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 30px 80px rgba(0,0,0,.6)", overflow: "hidden", zIndex: 60 }}
        >
          <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 10, padding: "16px 18px 12px" }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>Notifications</span>
            {unread.length > 0 && <span style={{ padding: "2px 9px", borderRadius: 100, border: "1px solid rgba(87,227,154,.45)", color: "#57E39A", fontSize: 11.5, fontWeight: 700 }}>{unread.length} new</span>}
            <button type="button" onClick={markAll} style={{ marginLeft: "auto", background: "none", border: 0, color: "#A8B6BE", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
              Mark all read
            </button>
          </div>

          <div style={{ flex: "none", display: "flex", gap: 6, padding: "2px 18px 12px", borderBottom: "1px solid rgba(255,255,255,.07)", overflowX: "auto" }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                style={{ padding: "6px 12px", borderRadius: 100, border: 0, cursor: "pointer", whiteSpace: "nowrap", fontSize: 12.5, fontWeight: 700, background: tab === t.key ? "#00C2CC" : "rgba(255,255,255,.05)", color: tab === t.key ? "#04191B" : "#B7C4CB" }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ overflowY: "auto" }}>
            {tab === "prices" ? (
              <div style={{ padding: "6px 18px 14px" }}>
                {!prices && <div style={{ padding: "18px 0", fontSize: 13, color: "#83919A" }}>Loading prices…</div>}
                {prices && Object.keys(prices).length === 0 && <div style={{ padding: "18px 0", fontSize: 13, color: "#83919A" }}>Prices are unavailable right now.</div>}
                {prices &&
                  PRICE_COINS.filter((c) => prices[c]).map((c) => {
                    const p = prices[c];
                    const flat = Math.abs(p.usd_24h_change) < 0.05;
                    const up = p.usd_24h_change >= 0;
                    return (
                      <div key={c} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.05)", fontSize: 13.5 }}>
                        <span style={{ width: 46, fontWeight: 800, color: "#fff" }}>{c}</span>
                        <span style={{ flex: 1, fontFamily: MONO, color: "#DCE5E9" }}>${p.usd >= 1 ? p.usd.toLocaleString("en-US", { maximumFractionDigits: 2 }) : p.usd.toPrecision(3)}</span>
                        <span style={{ fontFamily: MONO, fontWeight: 700, color: flat ? "#8E9CA5" : up ? "#57E39A" : "#FF6B7A" }}>{flat ? "–" : up ? "▲" : "▼"} {Math.abs(p.usd_24h_change).toFixed(1)}%</span>
                      </div>
                    );
                  })}
                {prices && Object.keys(prices).length > 0 && (
                  <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 10.5, color: "#77858E" }}>
                    <span>24h change · CoinGecko</span>
                    <Link href="/coins" onClick={() => setOpen(false)} style={{ color: "#00C2CC" }}>All coins →</Link>
                  </div>
                )}
              </div>
            ) : (
              shown.map((n) => {
                const isNew = seen ? !seen.has(n.id) : false;
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => {
                      markOne(n.id);
                      setOpen(false);
                    }}
                    className="hover:!bg-white/[0.04]"
                    style={{ position: "relative", display: "flex", gap: 12, padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,.05)", background: n.pinned ? "linear-gradient(90deg, rgba(255,197,49,.08), transparent 70%)" : undefined }}
                  >
                    {isNew && <span aria-label="New" style={{ position: "absolute", left: 7, top: 22, width: 6, height: 6, borderRadius: "50%", background: "#57E39A" }} />}
                    <span style={{ width: 40, height: 40, flex: "none", borderRadius: 10, overflow: "hidden", background: "#151C21", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                      {n.brand ? (
                        <BrandMark slug={n.brand} mono={n.title.slice(0, 2).toUpperCase()} tint={tintFor(n.brand)} radius={10} fontSize={11} />
                      ) : n.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={n.image} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span aria-hidden>📘</span>
                      )}
                    </span>
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        {n.pinned && <span style={{ padding: "1px 7px", borderRadius: 100, border: "1px solid rgba(255,197,49,.55)", color: "#FFC531", fontFamily: MONO, fontSize: 9, fontWeight: 800, letterSpacing: ".06em" }}>PINNED</span>}
                        <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: n.kind === "offer" ? "#FFC531" : n.kind === "guide" ? "#00C2CC" : "#B284FF" }}>{n.tag}</span>
                      </span>
                      <span style={{ display: "block", fontSize: 14, fontWeight: 700, lineHeight: 1.35, color: "#fff" }}>{n.title}</span>
                      <span style={{ display: "block", marginTop: 3, fontSize: 12.5, lineHeight: 1.4, color: "#A8B6BE" }}>{n.sub}</span>
                      {n.date && !n.pinned && <span style={{ display: "block", marginTop: 4, fontSize: 11.5, color: "#77858E" }}>{ago(n.date)}</span>}
                    </span>
                  </Link>
                );
              })
            )}
            {tab !== "prices" && shown.length === 0 && <div style={{ padding: "22px 18px", fontSize: 13, color: "#83919A" }}>Nothing here yet.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
