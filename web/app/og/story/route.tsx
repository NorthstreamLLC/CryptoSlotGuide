import type { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { ogSign } from "@/lib/og";
import { logoFor } from "@/lib/logo";
import { brandFor } from "@/lib/casino-facts";
import { siteData } from "@/lib/site-data";
import { CGA_REGISTER } from "@/lib/curacao-register";
import { BADGES, TIER_TINT, REGISTER_TONE, kycPicks, costPicks, registerParts, licenseePicks } from "@/lib/story-thumb";

/**
 * The share card (1200x630) for a story with a picture of its own: the title
 * on the left, and on the right the same data picture the homepage shows for
 * it (lib/story-thumb.ts). lib/og.ts storyCardPath builds the signed URL;
 * anything unsigned or altered gets a 400. Immutable, like the plain card:
 * changed text or data means a new URL.
 */
const KINDS = new Set(["casino", "kyc", "cost", "register", "licensees"]);
const hex = (c: string, a: number) => `${c}${Math.round(a * 255).toString(16).padStart(2, "0")}`;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const v = q.get("v") ?? "";
  const c = q.get("c") ?? "";
  const b = q.get("b") ?? "";
  const t = q.get("t") ?? "";
  const k = q.get("k") ?? "";
  const ok = KINDS.has(v) && t && t.length <= 120 && k.length <= 40 && (!b || b in BADGES) && q.get("s") === ogSign(t, `${k}|${v}|${c}|${b}`);
  const op = v === "casino" ? siteData.ops.find((o) => o.slug === c && logoFor(o.slug)?.endsWith(".png")) : null;
  if (!ok || (v === "casino" && !op)) return new Response("Bad card", { status: 400 });

  const origin = req.nextUrl.origin;
  const abs = (p: string) => new URL(p, origin).href;
  const badge = b ? BADGES[b as keyof typeof BADGES] : null;
  const tint = op ? brandFor(op.slug) : v === "kyc" ? "#57E39A" : v === "cost" ? "#FFC531" : v === "licensees" ? "#FF6B6B" : "#9AAE5E";
  const size = t.length > 80 ? 46 : t.length > 50 ? 54 : 62;

  const Logo = ({ slug, px }: { slug: string; px: number }) => (
    <div style={{ display: "flex", width: px, height: px, borderRadius: Math.round(px / 4.2), overflow: "hidden", border: `2px solid ${hex(brandFor(slug), 0.5)}`, background: "#11171B" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={abs(logoFor(slug) as string)} width={px} height={px} alt="" />
    </div>
  );

  let picture: React.ReactNode = null;
  if (op) {
    picture = (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
        <div style={{ display: "flex", width: 180, height: 180, borderRadius: 44, overflow: "hidden", border: `3px solid ${hex(tint, 0.6)}`, boxShadow: `0 0 120px ${hex(tint, 0.45)}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- drawn at the logo file's own 180px, so it stays sharp */}
          <img src={abs(logoFor(op.slug) as string)} width={180} height={180} alt="" />
        </div>
      </div>
    );
  } else if (v === "kyc") {
    const picks = kycPicks(16, true);
    picture = (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", gap: 26 }}>
        <div style={{ display: "flex", flexWrap: "wrap", width: 4 * 76 + 3 * 18, gap: 18 }}>
          {picks.map((r) => (
            <div key={r.slug} style={{ display: "flex", position: "relative" }}>
              <Logo slug={r.slug} px={76} />
              <div style={{ position: "absolute", right: -5, bottom: -5, width: 20, height: 20, borderRadius: 10, background: TIER_TINT[r.tier], border: "3px solid #0B0F12" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 18, fontSize: 17, color: "#A9B8C0" }}>
          {([["required", "ID to play"], ["threshold", "At a trigger"], ["never", "Never or if asked"]] as const).map(([tier, label]) => (
            <div key={tier} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: TIER_TINT[tier] }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  } else if (v === "licensees") {
    const slugs = licenseePicks(12, true);
    picture = (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", gap: 26 }}>
        <div style={{ display: "flex", flexWrap: "wrap", width: 4 * 80 + 3 * 18, gap: 18 }}>
          {slugs.map((s) => (
            <Logo key={s} slug={s} px={80} />
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 19, color: "#A9B8C0" }}>Crypto casinos we track on a Curaçao licence</div>
      </div>
    );
  } else if (v === "cost") {
    const rows = costPicks(5, true);
    const max = Math.max(...rows.map((r) => r.c), 1);
    picture = (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", height: "100%", gap: 22, padding: "0 34px" }}>
        <div style={{ display: "flex", fontSize: 20, color: "#A9B8C0" }}>Cost of the wagering on a $100 deposit</div>
        {rows.map((r) => (
          <div key={r.slug} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Logo slug={r.slug} px={52} />
            <div style={{ display: "flex", flex: 1, height: 20, borderRadius: 10, background: "rgba(255,255,255,.07)" }}>
              <div style={{ display: "flex", width: `${Math.max(8, (r.c / max) * 100)}%`, height: 20, borderRadius: 10, background: brandFor(r.slug) }} />
            </div>
            <div style={{ display: "flex", width: 86, justifyContent: "flex-end", fontSize: 28, fontWeight: 700, color: "#F2F5F7" }}>${Math.round(r.c).toLocaleString("en-US")}</div>
          </div>
        ))}
      </div>
    );
  } else {
    const parts = registerParts();
    picture = (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", height: "100%", padding: "0 40px" }}>
        <div style={{ display: "flex", fontSize: 140, fontWeight: 700, lineHeight: 1, letterSpacing: -6, color: "#fff" }}>{CGA_REGISTER.total}</div>
        <div style={{ display: "flex", marginTop: 8, fontSize: 24, color: "#A9B8C0" }}>licences on Curaçao&apos;s register</div>
        <div style={{ display: "flex", gap: 5, width: "100%", height: 26, marginTop: 30, borderRadius: 13, overflow: "hidden" }}>
          {parts.map((p) => (
            <div key={p.key} style={{ display: "flex", flexGrow: p.n, height: 26, background: REGISTER_TONE[p.tone] }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 22, marginTop: 20, fontSize: 19, color: "#A9B8C0" }}>
          {([["watch", "Assessment in progress"], ["ok", "Indefinite"], ["bad", "Expired or revoked"]] as const).map(([tone, label]) => (
            <div key={tone} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: REGISTER_TONE[tone] }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", padding: 48, gap: 40, background: `radial-gradient(circle at 92% 10%, ${hex(tint, 0.22)} 0%, #0B0F12 52%)`, color: "#FFFFFF" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560, padding: "16px 0 16px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={abs("/assets/logo-256.png")} width={52} height={52} alt="" />
            <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>
              <span>CryptoSlot</span>
              <span style={{ color: "#00C2CC" }}>Guide</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: hex(tint, 1) }}>{k}</div>
            <div style={{ display: "flex", fontSize: size, fontWeight: 700, lineHeight: 1.08 }}>{t}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 20, color: "#9FB0B9" }}>
            <div style={{ width: 44, height: 5, borderRadius: 3, background: "#FFC531" }} />
            Every figure sourced · 18+
          </div>
        </div>
        <div style={{ display: "flex", position: "relative", flex: 1, borderRadius: 32, overflow: "hidden", border: `2px solid ${hex(tint, 0.35)}`, background: `radial-gradient(circle at 50% 35%, ${hex(tint, 0.2)} 0%, #0D1215 70%)` }}>
          {picture}
          {badge && (
            <div style={{ display: "flex", position: "absolute", top: 22, left: 22, padding: "8px 16px", borderRadius: 100, fontSize: 20, fontWeight: 700, color: "#FF6B6B", background: "rgba(255,107,107,.14)", border: "2px solid rgba(255,107,107,.5)" }}>{badge.text}</div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
  );
}
