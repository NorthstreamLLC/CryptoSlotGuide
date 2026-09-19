import Link from "next/link";
import { WORLD_SHAPES, US_SHAPES } from "@/lib/legal";
import { countryOf, type Studio } from "@/lib/studios";
import { LegalMap } from "@/components/legal/LegalMap";
import { MapHover, type HoverInfo } from "@/components/legal/MapHover";

const MONO = "var(--font-jetbrains-mono), monospace";
const ON = "#2FB67A";
const OFF = "#1C2328";

/** A studio's licences: world map, a US state map when it holds US licences, and the full list with sources. */
export function StudioLicences({ studio }: { studio: Studio }) {
  const countries = new Set(studio.licences.map((l) => countryOf(l.code)));
  const usStates = new Set(studio.licences.filter((l) => l.code.startsWith("US-")).map((l) => l.code.slice(3)));

  const worldInfo: Record<string, HoverInfo> = {};
  for (const l of studio.licences) {
    const c = countryOf(l.code);
    const shape = WORLD_SHAPES.find((s) => s.code === c);
    const cur = worldInfo[c] ?? { name: shape?.name ?? l.name, rows: [], noLink: true };
    cur.rows.push({ label: l.code.includes("-") ? l.name : "Regulator", value: l.regulator, color: ON });
    worldInfo[c] = cur;
  }
  const usInfo: Record<string, HoverInfo> = {};
  for (const l of studio.licences.filter((x) => x.code.startsWith("US-"))) {
    usInfo[l.code.slice(3)] = { name: l.name, rows: [{ label: "Regulator", value: l.regulator, color: ON }], noLink: true };
  }

  return (
    <section style={{ maxWidth: 1180, margin: "0 auto", padding: "8px 24px 72px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 8 }}>Licences</div>
      <h2 style={{ margin: "0 0 6px", fontSize: 30, lineHeight: 1.1, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>Where {studio.name} is licensed</h2>
      <p style={{ margin: "0 0 18px", maxWidth: "70ch", fontSize: 15, lineHeight: 1.6, color: "#A8B6BE" }}>
        {studio.licences.length} licences and approvals across {countries.size} {countries.size === 1 ? "country" : "countries"}
        {usStates.size ? `, including ${usStates.size} US ${usStates.size === 1 ? "state" : "states"}` : ""}, as listed on {studio.name}&apos;s own site. Hover a market for the regulator.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: usStates.size ? "repeat(auto-fit, minmax(420px, 1fr))" : "1fr", gap: 14 }}>
        <div style={{ padding: 16, borderRadius: 18, background: "#0B0F12", border: "1px solid rgba(255,255,255,.07)" }}>
          <MapHover info={worldInfo}>
            <LegalMap shapes={WORLD_SHAPES} viewBox="0 0 960 470" statusOf={() => undefined} hrefOf={() => null} fillOf={(c) => (countries.has(c) ? ON : OFF)} legend={[{ color: ON, label: "Licensed" }, { color: OFF, label: "Not listed" }]} />
          </MapHover>
        </div>
        {usStates.size > 0 && (
          <div style={{ padding: 16, borderRadius: 18, background: "#0B0F12", border: "1px solid rgba(255,255,255,.07)" }}>
            <MapHover info={usInfo}>
              <LegalMap shapes={US_SHAPES} viewBox="0 0 975 610" labels statusOf={() => undefined} hrefOf={() => null} fillOf={(c) => (usStates.has(c) ? ON : OFF)} legend={[{ color: ON, label: "Licensed US state" }, { color: OFF, label: "Not listed" }]} />
            </MapHover>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, padding: "8px 24px", borderRadius: 18, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
        {studio.licences.map((l, i) => (
          <div key={l.code + i} style={{ display: "grid", gridTemplateColumns: "minmax(110px, 190px) 1fr", gap: 14, padding: "12px 0", borderTop: i ? "1px solid rgba(255,255,255,.06)" : undefined }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: "#A8B6BE" }}>{l.name}</div>
            <div style={{ fontSize: 13.5, color: "#C6D1D7" }}>
              {l.regulator}{" "}
              <a href={l.url} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>source ↗</a>
              {l.note && <div style={{ fontSize: 12, color: "#6E7F88", marginTop: 2 }}>{l.note}</div>}
            </div>
          </div>
        ))}
      </div>
      <p style={{ margin: "14px 0 0", fontSize: 13, color: "#7B8A93" }}>
        Studios often hold more licences than they publish, so a blank market doesn&apos;t always mean no licence.{" "}
        <Link href={`/providers/licences?studio=${studio.slug}`} style={{ color: "#00C2CC", fontWeight: 700 }}>Compare with other studios →</Link>
      </p>
    </section>
  );
}
