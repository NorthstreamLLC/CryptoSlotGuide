import Link from "next/link";
import { casinosByAccess } from "@/lib/legal";
import { BrandMark } from "@/components/ui/BrandMark";
import { brandFor } from "@/lib/casino-facts";

const GROUPS = [
  { key: "accepts", title: (n: string) => `Crypto casinos that accept players from ${n}`, sub: (n: string) => `Their own restricted-countries lists don't include ${n}.`, border: "rgba(47,182,122,.4)", tag: "Accepts players", tagColor: "#7BE0B8" },
  { key: "partial", title: (n: string) => `Not listed as restricted, but check first`, sub: (n: string) => `These casinos don't name ${n}, but say their list isn't complete.`, border: "rgba(199,164,92,.4)", tag: "Check terms", tagColor: "#D6B65C" },
  { key: "restricted", title: (n: string) => `Crypto casinos that restrict ${n}`, sub: (n: string) => `These casinos name ${n} in their own restricted-countries list.`, border: "rgba(196,101,58,.35)", tag: "Restricted", tagColor: "#DA9877" },
] as const;

/** Every crypto casino on the site grouped by whether it takes players from this country. */
export function CasinoAccess({ code, name }: { code: string; name: string }) {
  const by = casinosByAccess(code);
  return (
    <>
      {GROUPS.map((g) => {
        const list = by[g.key];
        if (!list.length) return null;
        return (
          <div key={g.key}>
            <h2 style={{ margin: "34px 0 6px", fontSize: 24, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>
              {g.title(name)} <span style={{ fontSize: 16, color: "#8E9CA5" }}>({list.length})</span>
            </h2>
            <p style={{ margin: "0 0 14px", fontSize: 14, color: "#8DA0AA" }}>{g.sub(name)}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
              {list.map((o) => (
                <Link key={o.slug} href={`/casinos/${o.slug}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "#0C1013", border: `1px solid ${g.border}`, fontSize: 14, fontWeight: 700, color: g.key === "restricted" ? "#8DA0AA" : "#E8EDF0" }}>
                  <span style={{ width: 26, height: 26, flex: "none", borderRadius: 7, overflow: "hidden", opacity: g.key === "restricted" ? 0.55 : 1 }}>
                    <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={7} fontSize={9} />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    {o.name}
                    <span style={{ display: "block", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, fontWeight: 600, color: g.tagColor }}>{o.except.length ? `${g.tag}, except ${o.except.join(", ")}` : g.tag}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
