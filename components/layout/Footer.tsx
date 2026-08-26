import Link from "next/link";
import { footerLinks, navTabs } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="border-t border-border bg-section">
      <div className="mx-auto max-w-[1400px] px-10 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {navTabs.map((tab) => (
            <div key={tab.label}>
              <h3 className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.07em] text-text-dim">
                {tab.label}
              </h3>
              <ul className="flex flex-col gap-2">
                {tab.sections.slice(0, 5).map((section) => (
                  <li key={section.label}>
                    <Link
                      href={section.href}
                      className="text-[13px] text-text-secondary transition-colors hover:text-accent"
                    >
                      {section.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="font-mono text-[11px] text-text-dim">
            © {new Date().getFullYear()} CryptoSlotGuide. Not affiliated with any operator listed.
          </p>
          <ul className="flex flex-wrap gap-5">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-[12.5px] text-text-dim-2 hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
