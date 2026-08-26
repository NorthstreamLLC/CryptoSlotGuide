"use client";

import Link from "next/link";
import { useState } from "react";
import { navTabs } from "@/lib/nav";

export function Header() {
  const [menu, setMenu] = useState<string | null>(null);
  const [rail, setRail] = useState<string | null>(null);

  const activeTab = navTabs.find((t) => t.label === menu);
  const activeSection =
    activeTab?.sections.find((s) => s.label === rail) ?? activeTab?.sections[0];

  function closeMenu() {
    setMenu(null);
    setRail(null);
  }

  return (
    <header
      className="sticky top-0 z-40 h-[68px] border-b border-border bg-page/92 backdrop-blur-[14px]"
      onMouseLeave={closeMenu}
    >
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-8 px-10">
        <Link href="/" className="font-sans text-[17px] font-extrabold tracking-[-0.02em] text-text-primary">
          Crypto<span className="text-accent">Slot</span>Guide
        </Link>

        <nav className="flex h-full items-center gap-1">
          {navTabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onMouseEnter={() => {
                setMenu(tab.label);
                setRail(tab.sections[0]?.label ?? null);
              }}
              onClick={() => setMenu(menu === tab.label ? null : tab.label)}
              className="rounded-btn px-3 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:text-text-primary"
              aria-expanded={menu === tab.label}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/search"
            className="text-[13px] font-mono text-text-dim transition-colors hover:text-accent"
            aria-label="Search"
          >
            ⌕ Search
          </Link>
        </div>
      </div>

      {activeTab && activeSection && (
        <div
          className="animate-[csg-rise_0.2s_ease] absolute left-0 right-0 border-b border-border bg-menu shadow-dropdown"
          role="menu"
        >
          <div className="mx-auto flex max-w-[1400px] gap-0 px-10 py-6">
            <ul className="w-[220px] shrink-0 border-r border-border pr-6">
              {activeTab.sections.map((section) => (
                <li key={section.label}>
                  <Link
                    href={section.href}
                    onMouseEnter={() => setRail(section.label)}
                    onClick={closeMenu}
                    className={`flex items-center gap-2 rounded-btn px-3 py-2 text-[13px] transition-colors ${
                      activeSection.label === section.label
                        ? "bg-surface-raised text-text-primary"
                        : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
                    }`}
                  >
                    <span aria-hidden>{section.emoji}</span>
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="grid flex-1 grid-cols-2 gap-8 pl-8">
              {activeSection.columns.map((col, i) => (
                <ul key={i} className="flex flex-col gap-1">
                  {col.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className="block rounded-btn px-2 py-1.5 text-[13px] text-text-secondary transition-colors hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
              <div className="col-span-2 mt-2 border-t border-border pt-3">
                <Link
                  href={activeSection.href}
                  onClick={closeMenu}
                  className="text-[12.5px] font-mono text-accent hover:text-accent-bright"
                >
                  {activeSection.seeAllLabel} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
