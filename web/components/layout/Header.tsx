"use client";

import Link from "next/link";
import { useState } from "react";
import { buildNavTabs, type NavTab } from "@/lib/nav";
import type { SiteCounts } from "@/lib/derived";

/**
 * Ported from the `<header>` block in CryptoSlotGuide.dc.html (search that
 * file for `<header onMouseLeave`). Structure, spacing and colors are the
 * real ones — see lib/nav.ts for where the mega-menu content comes from.
 */
export function Header({ counts }: { counts: SiteCounts }) {
  const navTabs = buildNavTabs(counts);
  const [menu, setMenu] = useState<string | null>(null);
  const [rail, setRail] = useState(0);

  const activeTab: NavTab | undefined = navTabs.find((t) => t.key === menu);
  const activeSection = activeTab?.sections[Math.min(rail, activeTab.sections.length - 1)];

  function closeMenu() {
    setMenu(null);
    setRail(0);
  }

  return (
    <header
      onMouseLeave={closeMenu}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(9,12,15,.92)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,.07)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 40px",
          minHeight: 68,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 1,
            color: "#fff",
            fontWeight: 800,
            fontSize: 17,
            letterSpacing: "-.02em",
            fontStretch: "112%",
            whiteSpace: "nowrap",
          }}
        >
          <span>CryptoSlot</span>
          <span style={{ color: "#00C2CC" }}>Guide</span>
        </Link>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
            flex: "0 1 auto",
            minWidth: 0,
            fontSize: 13.5,
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {navTabs.map((tab) => {
            const active = menu === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setMenu(active ? null : tab.key)}
                onMouseEnter={() => {
                  setMenu(tab.key);
                  setRail(0);
                }}
                className="hover:!text-white"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "8px 9px",
                  border: 0,
                  borderRadius: 8,
                  background: active ? "rgba(255,255,255,.06)" : "transparent",
                  fontSize: 13.5,
                  fontWeight: 500,
                  letterSpacing: "-.005em",
                  color: active ? "#fff" : "#A8B6BE",
                  cursor: "pointer",
                }}
              >
                {tab.label}
                <span style={{ fontSize: 8, opacity: 0.5 }}>▾</span>
              </button>
            );
          })}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "none", marginLeft: "auto" }}>
          <Link
            href="/search"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 12px",
              border: "1px solid rgba(255,255,255,.10)",
              borderRadius: 8,
              background: "rgba(255,255,255,.02)",
              color: "#5C6A72",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11.5,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: "#3D4A52" }}>⌕</span>
            <span>search</span>
          </Link>
          <span
            style={{
              padding: "5px 9px",
              border: "1px solid rgba(255,255,255,.14)",
              borderRadius: 5,
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 10.5,
              fontWeight: 700,
              color: "#8DA0AA",
            }}
          >
            18+
          </span>
        </div>
      </div>

      {activeTab && activeSection && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "100%",
            zIndex: 60,
            display: "flex",
            justifyContent: "center",
            padding: "10px 40px 0",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 1120,
              display: "grid",
              gridTemplateColumns: "264px 1fr",
              background: "#0B0F12",
              border: "1px solid rgba(255,255,255,.09)",
              borderRadius: 14,
              boxShadow: "0 30px 80px rgba(0,0,0,.62)",
              overflow: "hidden",
              animation: "csg-rise .14s ease both",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                padding: 14,
                background: "#080B0E",
                borderRight: "1px solid rgba(255,255,255,.07)",
              }}
            >
              {activeTab.sections.map((section, i) => {
                const isActive = i === rail;
                return (
                  <Link
                    key={section.label + i}
                    href={section.href}
                    onMouseEnter={() => setRail(i)}
                    onClick={closeMenu}
                    className="hover:!text-white"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      padding: "10px 11px",
                      borderRadius: 9,
                      background: isActive ? "rgba(255,255,255,.055)" : "transparent",
                      color: isActive ? "#fff" : "#AFBDC4",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 29,
                        height: 29,
                        flex: "none",
                        borderRadius: 8,
                        background: isActive ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.03)",
                        border: `1px solid ${isActive ? "rgba(255,255,255,.16)" : "rgba(255,255,255,.07)"}`,
                        fontSize: 14,
                        lineHeight: 1,
                      }}
                    >
                      {section.mono}
                    </span>
                    <span style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: "-.012em" }}>
                      {section.label}
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: 12, color: isActive ? "#00C2CC" : "#39454C" }}>
                      ›
                    </span>
                  </Link>
                );
              })}
              <div
                style={{
                  marginTop: 14,
                  paddingTop: 14,
                  borderTop: "1px solid rgba(255,255,255,.07)",
                }}
              >
                <Link
                  href="/search"
                  onClick={closeMenu}
                  className="hover:!text-[#5FE3E8]"
                  style={{ padding: "0 11px", fontSize: 12.5, fontWeight: 600, color: "#00C2CC" }}
                >
                  See all {counts.total} reviews →
                </Link>
              </div>
            </div>

            <div style={{ display: "flex", gap: 64, padding: "26px 34px 32px" }}>
              {activeSection.columns.map((col, i) => (
                <div key={col.title + i} style={{ flex: 1, minWidth: 0, maxWidth: 280 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                        fontSize: 9.5,
                        letterSpacing: ".11em",
                        textTransform: "uppercase",
                        color: "#5C6A72",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col.title}
                    </span>
                    <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {col.links.map((link) => (
                      <Link
                        key={link.href + link.label}
                        href={link.href}
                        onClick={closeMenu}
                        className="hover:!text-accent"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "7px 0",
                          fontSize: 14,
                          fontWeight: 500,
                          letterSpacing: "-.012em",
                          color: "#C3CFD5",
                        }}
                      >
                        {link.label}
                        {link.dot && (
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              flex: "none",
                              background: link.dot,
                            }}
                          />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          justifyContent: "center",
          padding: "7px 40px",
          background: "rgba(0,194,204,.06)",
          borderTop: "1px solid rgba(0,194,204,.12)",
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 11,
          color: "#7FA9AE",
          letterSpacing: ".03em",
        }}
      >
        <strong style={{ color: "#00C2CC", fontWeight: 700 }}>ADVERTISER DISCLOSURE</strong>
        <span style={{ color: "#4E6469" }}>·</span>
        <span>
          We earn commission from some operators listed here. Commission never changes a score — read{" "}
          <Link href="/how-we-rate" style={{ color: "#9FD9DD", textDecoration: "underline", textUnderlineOffset: 2 }}>
            how we rate
          </Link>
          .
        </span>
      </div>
    </header>
  );
}
