import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { tintFor } from "@/lib/logo";

export interface StripItem {
  slug: string;
  name: string;
  href: string;
  kind: string;
}

/**
 * One slow, endless row of what the site covers (casinos, studios, wallets),
 * each logo a link to its page. The row is doubled and moves by -50%, so it
 * loops without a seam; the second copy is hidden from screen readers and
 * the tab order, so each link is announced once. Hovering or focusing pauses
 * it; reduced motion stops it (globals.css).
 */
export function LogoStrip({ items, label }: { items: StripItem[]; label: string }) {
  if (items.length < 8) return null;
  const tile = (it: StripItem, copy: boolean) => (
    <Link
      key={`${copy ? "b" : "a"}-${it.kind}-${it.slug}`}
      href={it.href}
      title={`${it.name} · ${it.kind}`}
      aria-hidden={copy || undefined}
      tabIndex={copy ? -1 : undefined}
      className="csg-strip-tile"
    >
      <span style={{ width: 28, height: 28, flex: "none", borderRadius: 7, overflow: "hidden" }}>
        <BrandMark slug={it.slug} mono={it.name.slice(0, 2).toUpperCase()} tint={tintFor(it.slug)} radius={7} fontSize={9} />
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#DCE5E9", whiteSpace: "nowrap" }}>{it.name}</span>
      <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9, letterSpacing: ".06em", textTransform: "uppercase", color: "#6F7E87" }}>{it.kind}</span>
    </Link>
  );
  return (
    <nav aria-label={label} className="csg-strip">
      <div className="csg-strip-track">
        {items.map((it) => tile(it, false))}
        {items.map((it) => tile(it, true))}
      </div>
    </nav>
  );
}
