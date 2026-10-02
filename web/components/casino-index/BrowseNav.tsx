"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * The casino section's own menu, stuck under the site header on every
 * casino list page: the measured cuts, then the other ways in. The hero had
 * six filter pills that scrolled away with it, and the other routes — by
 * coin, by country, compare, the quiz — were only in the mega-menu. A
 * reader two screens into the table should not have to go back up, or back
 * out to the header, to switch cut.
 *
 * Route links, not anchors: each cut is its own page with its own
 * ItemList, so switching keeps the structured data honest.
 */
const ITEMS: { href: string; label: string }[] = [
  { href: "/crypto-casinos", label: "All casinos" },
  { href: "/crypto-casinos/no-kyc", label: "No-KYC" },
  { href: "/fastest-payouts", label: "Fastest payouts" },
  { href: "/lowest-wagering", label: "Easiest bonuses" },
  { href: "/casino-sportsbooks", label: "With a sportsbook" },
  { href: "/esports-casinos", label: "Esports" },
  { href: "/crypto-casinos/accepting/bitcoin", label: "By coin" },
  { href: "/legal", label: "By country" },
  { href: "/compare", label: "Compare" },
  { href: "/find-my-casino", label: "Find my casino" },
];

const MONO = "var(--font-jetbrains-mono), monospace";

export function BrowseNav() {
  const path = usePathname();
  const [top, setTop] = useState(64);
  useEffect(() => {
    const header = document.querySelector("header");
    const measure = () => setTop(header ? header.getBoundingClientRect().height : 64);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const isOn = (href: string) => (href === "/crypto-casinos/accepting/bitcoin" ? path.startsWith("/crypto-casinos/accepting") : path === href);
  return (
    <nav
      aria-label="Browse casinos"
      style={{ position: "sticky", top, zIndex: 20, background: "rgba(7,9,11,.86)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,.06)" }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "10px 40px", display: "flex", alignItems: "center", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
        <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#83919A", marginRight: 6, whiteSpace: "nowrap" }}>Browse</span>
        {ITEMS.map((i) => {
          const on = isOn(i.href);
          return (
            <Link
              key={i.href}
              href={i.href}
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
