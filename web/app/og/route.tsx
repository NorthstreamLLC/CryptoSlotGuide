import type { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { ogSign } from "@/lib/og";

/**
 * The share card (1200x630) for any page without a picture of its own —
 * lib/og.ts builds the signed URL from the page's title. Unsigned or altered
 * text gets a 400, never an image. Cards are immutable: the signature changes
 * with the text, so a renamed page gets a new URL rather than a stale card.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const t = q.get("t") ?? "";
  const k = q.get("k") ?? "";
  if (!t || t.length > 120 || k.length > 40 || q.get("s") !== ogSign(t, k)) return new Response("Bad card", { status: 400 });

  const logo = new URL("/assets/logo-256.png", req.nextUrl.origin).href;
  const size = t.length > 70 ? 56 : t.length > 40 ? 66 : 78;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "radial-gradient(circle at 85% 0%, #0E3A3D 0%, #0B0F12 55%)",
          color: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={64} height={64} alt="" />
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
            <span>CryptoSlot</span>
            <span style={{ color: "#00C2CC" }}>Guide</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#5FE3E8" }}>{k}</div>
          <div style={{ display: "flex", fontSize: size, fontWeight: 700, lineHeight: 1.08, maxWidth: 1050 }}>{t}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#9FB0B9" }}>
          <div style={{ width: 56, height: 6, borderRadius: 3, background: "#FFC531" }} />
          Every figure sourced from the operator or studio · 18+
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
  );
}
