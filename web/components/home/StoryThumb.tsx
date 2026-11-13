import { logoFor } from "@/lib/logo";
import { brandFor } from "@/lib/casino-facts";
import { CGA_REGISTER } from "@/lib/curacao-register";
import { TONE, TIER_TINT, REGISTER_TONE, kycPicks, costPicks, registerParts, licenseePicks, type ThumbSpec } from "@/lib/story-thumb";
import { GuideCover } from "@/components/guides/GuideCover";

export { thumbForNews, type ThumbSpec } from "@/lib/story-thumb";

/**
 * Thumbnails for the homepage's Latest stories, drawn from the data each story
 * is about rather than a stock icon: the casino's own logo for news about one
 * casino, the casinos coloured by when they ask for ID for the KYC tracker,
 * what each bonus costs for the true-cost index, the regulator's register for
 * the Curaçao stories. Every figure on a thumbnail is one the story itself
 * shows, so the picture never says more than the page does.
 */
type Size = "lead" | "mini";

export function StoryThumb({ spec, size }: { spec: ThumbSpec; size: Size }) {
  if (spec.kind === "cover") return <GuideCover category={spec.category} tint={spec.tint} rounded={0} label={false} tile={size === "mini"} />;
  return (
    <span className={`st st-${size} st-${spec.kind}`}>
      <style>{CSS}</style>
      {spec.kind === "casino" && <CasinoThumb slug={spec.slug} size={size} />}
      {spec.kind === "kyc" && <KycThumb size={size} />}
      {spec.kind === "cost" && <CostThumb size={size} />}
      {spec.kind === "register" && <RegisterThumb size={size} />}
      {spec.kind === "licensees" && <LicenseesThumb size={size} />}
      {"badge" in spec && spec.badge && (
        <span className="st-badge" style={{ ["--tone" as string]: TONE[spec.badge.tone] }} title={spec.badge.text}>
          {size === "lead" ? spec.badge.text : "!"}
        </span>
      )}
    </span>
  );
}

function Logo({ slug, px }: { slug: string; px: number }) {
  const src = logoFor(slug);
  return (
    <span className="st-logo" style={{ width: px, height: px, borderRadius: Math.round(px / 4.2), ["--tint" as string]: brandFor(slug) }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 180px logos, drawn small */}
      {src && <img src={src} alt="" width={px} height={px} loading="lazy" />}
    </span>
  );
}

function CasinoThumb({ slug, size }: { slug: string; size: Size }) {
  const tint = brandFor(slug);
  return (
    <span className="st-fill" style={{ ["--tint" as string]: tint, background: `radial-gradient(70% 90% at 50% 40%, color-mix(in srgb, ${tint} 34%, transparent), transparent 70%), #0B0F12` }}>
      <span className="st-grid" aria-hidden />
      <span className="st-glow" aria-hidden />
      <Logo slug={slug} px={size === "lead" ? 128 : 44} />
    </span>
  );
}

function KycThumb({ size }: { size: Size }) {
  const picked = kycPicks(size === "lead" ? 18 : 6);
  return (
    <span className="st-fill" style={{ background: "radial-gradient(80% 90% at 50% 30%, rgba(87,227,154,.16), transparent 70%), #0B0F12" }}>
      <span className="st-grid" aria-hidden />
      <span className="st-mosaic" data-keep-grid style={{ gridTemplateColumns: `repeat(${size === "lead" ? 6 : 3}, auto)` }}>
        {picked.map((r) => (
          <span key={r.slug} className="st-cell">
            <Logo slug={r.slug} px={size === "lead" ? 46 : 22} />
            <i style={{ background: TIER_TINT[r.tier] }} />
          </span>
        ))}
      </span>
      {size === "lead" && (
        <span className="st-legend">
          <span><i style={{ background: TIER_TINT.required }} />Required to play or withdraw</span>
          <span><i style={{ background: TIER_TINT.threshold }} />At a published trigger</span>
          <span><i style={{ background: TIER_TINT.never }} />Never, or only if asked</span>
        </span>
      )}
    </span>
  );
}

function CostThumb({ size }: { size: Size }) {
  const pick = costPicks(size === "lead" ? 5 : 3);
  const max = Math.max(...pick.map((r) => r.c), 1);
  return (
    <span className="st-fill" style={{ background: "radial-gradient(80% 90% at 30% 20%, rgba(255,197,49,.16), transparent 70%), #0B0F12" }}>
      <span className="st-grid" aria-hidden />
      <span className="st-bars">
        {pick.map((r) => (
          <span key={r.slug} className="st-bar">
            <Logo slug={r.slug} px={size === "lead" ? 30 : 14} />
            <span className="st-track"><span style={{ width: `${Math.max(8, (r.c / max) * 100)}%`, background: brandFor(r.slug) }} /></span>
            {size === "lead" && <b>${Math.round(r.c).toLocaleString("en-US")}</b>}
          </span>
        ))}
      </span>
    </span>
  );
}

function LicenseesThumb({ size }: { size: Size }) {
  const slugs = licenseePicks(size === "lead" ? 12 : 6);
  return (
    <span className="st-fill" style={{ background: "radial-gradient(80% 90% at 50% 30%, rgba(255,107,107,.2), transparent 70%), #0B0F12" }}>
      <span className="st-grid" aria-hidden />
      <span className="st-mosaic" data-keep-grid style={{ gridTemplateColumns: `repeat(${size === "lead" ? 6 : 3}, auto)` }}>
        {slugs.map((s) => (
          <span key={s} className="st-cell">
            <Logo slug={s} px={size === "lead" ? 50 : 22} />
          </span>
        ))}
      </span>
      {size === "lead" && <span className="st-legend">Crypto casinos we track on a Curaçao licence</span>}
    </span>
  );
}

function RegisterThumb({ size }: { size: Size }) {
  const tone = REGISTER_TONE;
  const parts = registerParts();
  return (
    <span className="st-fill" style={{ background: "radial-gradient(80% 90% at 50% 20%, rgba(154,174,94,.2), transparent 70%), #0B0F12" }}>
      <span className="st-grid" aria-hidden />
      <span className="st-reg">
        <b>{CGA_REGISTER.total}</b>
        {size === "lead" && <small>entries on Curaçao&apos;s register</small>}
        <span className="st-stack">
          {parts.map((c) => (
            <span key={c.key} style={{ flex: c.n, background: tone[c.tone] }} title={`${c.label}: ${c.n}`} />
          ))}
        </span>
        {size === "lead" && (
          <span className="st-legend st-legend-in">
            <span><i style={{ background: tone.watch }} />Assessment in progress</span>
            <span><i style={{ background: tone.ok }} />Indefinite</span>
            <span><i style={{ background: tone.bad }} />Expired or revoked</span>
          </span>
        )}
      </span>
    </span>
  );
}

const CSS = `
.st { position: relative; display: block; width: 100%; height: 100%; overflow: hidden; }
.st-fill { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.st-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px); background-size: 22px 22px; mask-image: radial-gradient(80% 80% at 50% 40%, #000, transparent); }
.st-mini .st-grid { background-size: 10px 10px; }
.st-glow { position: absolute; width: 46%; aspect-ratio: 1; border-radius: 50%; background: var(--tint); opacity: .18; filter: blur(40px); }
.st-logo { position: relative; display: block; flex: none; overflow: hidden; background: color-mix(in srgb, var(--tint) 20%, #11171B); box-shadow: 0 0 0 1px color-mix(in srgb, var(--tint) 40%, transparent), 0 10px 30px rgba(0,0,0,.45); }
.st-logo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.st-mini .st-logo { box-shadow: 0 0 0 1px color-mix(in srgb, var(--tint) 40%, transparent); }
.st-mosaic { position: relative; display: grid; gap: 12px; }
.st-mini .st-mosaic { gap: 6px; }
.st-cell { position: relative; display: block; }
.st-cell i { position: absolute; right: -3px; bottom: -3px; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 0 2px #0B0F12; }
.st-mini .st-cell i { width: 7px; height: 7px; right: -2px; bottom: -2px; box-shadow: 0 0 0 1.5px #0B0F12; }
.st-legend { position: absolute; left: 16px; bottom: 14px; display: flex; gap: 14px; flex-wrap: wrap; font-size: 11.5px; font-weight: 600; color: #A9B8C0; }
.st-legend span { display: inline-flex; align-items: center; gap: 6px; }
.st-legend i { width: 8px; height: 8px; border-radius: 50%; }
.st-legend-in { position: static; margin-top: 12px; }
.st-bars { position: relative; display: flex; flex-direction: column; gap: 12px; width: 72%; }
.st-mini .st-bars { gap: 6px; width: 80%; }
.st-bar { display: flex; align-items: center; gap: 12px; }
.st-mini .st-bar { gap: 6px; }
.st-track { flex: 1; height: 12px; border-radius: 6px; background: rgba(255,255,255,.06); overflow: hidden; }
.st-mini .st-track { height: 6px; border-radius: 3px; }
.st-track span { display: block; height: 100%; border-radius: inherit; }
.st-bar b { width: 54px; text-align: right; font-size: 15px; font-weight: 700; color: #F2F5F7; font-variant-numeric: tabular-nums; }
.st-reg { position: relative; display: flex; flex-direction: column; align-items: flex-start; width: 74%; }
.st-reg b { font-size: 54px; line-height: 1; font-weight: 700; letter-spacing: -.04em; color: #fff; }
.st-mini .st-reg b { font-size: 22px; }
.st-reg small { margin-top: 4px; font-size: 13px; color: #A9B8C0; }
.st-stack { display: flex; gap: 3px; width: 100%; height: 14px; margin-top: 16px; border-radius: 7px; overflow: hidden; }
.st-mini .st-stack { height: 7px; margin-top: 7px; gap: 2px; }
.st-badge { position: absolute; top: 12px; left: 12px; padding: 4px 9px; border-radius: 100px; font-size: 11.5px; font-weight: 700; color: var(--tone); background: color-mix(in srgb, var(--tone) 16%, rgba(7,9,11,.85)); border: 1px solid color-mix(in srgb, var(--tone) 45%, transparent); }
@media (max-width: 560px) {
  .st-lead .st-cell .st-logo { width: 34px !important; height: 34px !important; border-radius: 9px !important; }
  .st-lead .st-mosaic { gap: 8px; }
  .st-lead .st-legend { display: none; }
  .st-lead .st-reg b { font-size: 40px; }
  .st-lead .st-bar b { font-size: 13px; width: 44px; }
}
.st-mini .st-badge { top: 5px; left: auto; right: 5px; width: 16px; height: 16px; padding: 0; display: flex; align-items: center; justify-content: center; font-size: 10.5px; font-weight: 800; }
`;
