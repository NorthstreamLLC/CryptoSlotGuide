import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { CodeChip } from "@/components/ui/CodeChip";
import { siteData } from "@/lib/site-data";
import vip from "@/data/vip.json";

const MONO = "var(--font-jetbrains-mono), monospace";
const GOLD = "#FFC531";

/**
 * "Want more from <slot>?" — three ways in, on every slot page: our partner
 * casino, our own VIP team, and the weekly email.
 *
 * What it does not say: that the slot is playable at the casino. No
 * casino-to-game mapping is on file (see FeaturedPartner's rule 2), so the
 * casino card offers somewhere to play, not this game. The VIP card renders
 * only once data/vip.json holds the team's real Telegram link, and the code
 * only once it holds the code: until then neither is promised.
 */
export function SlotPerks({ slot, signupHref }: { slot: string; signupHref: string }) {
  const o = siteData.ops.find((x) => x.slug === vip.partner);
  const telegram = vip.telegram as string | null;
  const code = vip.code as string | null;
  if (!o) return null;

  const card = { display: "flex", flexDirection: "column" as const, gap: 10, padding: "18px 20px", borderRadius: 16, background: "#0E1316", border: "1px solid rgba(255,255,255,.08)", minWidth: 0 };
  const label = { fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase" as const, color: "#8E9CA5" };

  return (
    <section style={{ margin: "8px 0 0" }}>
      <h2 style={{ margin: "0 0 14px", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>Want more from {slot}?</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        <div style={{ ...card, background: `radial-gradient(120% 120% at 100% 0%, ${GOLD}1c, transparent 55%), #0E1316`, border: `1px solid ${GOLD}55` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 42, height: 42, flex: "none" }}>
              <BrandMark slug={o.slug} mono={o.mono} tint={GOLD} radius={10} fontSize={11} />
            </span>
            <span>
              <span style={{ display: "block", fontSize: 16, fontWeight: 800, color: "#fff" }}>Play at {o.name}</span>
              <span style={{ ...label, color: GOLD }}>Our top casino</span>
            </span>
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.4, color: "#E8EDF0" }}>{o.bonusShort}</div>
          {code && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#A8B6BE" }}>
              Sign up with code <CodeChip code={code} size="sm" bare />
            </div>
          )}
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: "auto", paddingTop: 4 }}>
            {o.signupUrl ? (
              <a href={o.signupUrl} target="_blank" rel="noopener sponsored nofollow" {...(code ? { "data-copy-code": code } : {})} style={{ padding: "10px 16px", borderRadius: 10, background: GOLD, color: "#141007", fontSize: 13.5, fontWeight: 800 }}>
                Visit {o.name} →
              </a>
            ) : null}
            <Link href={`/casinos/${o.slug}`} style={{ fontSize: 13, fontWeight: 700, color: "#A8B6BE" }}>
              Review
            </Link>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9.5, lineHeight: 1.5, color: "#7F8D96" }}>{o.name}&apos;s own offer · Affiliate link · 18+</div>
        </div>

        {telegram && (
          <div style={card}>
            <span style={label}>{vip.name} · our VIP team</span>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1.35 }}>Looking for an exclusive VIP host?</div>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#A8B6BE" }}>
              {vip.name} is our own VIP team, for players who join {o.name} through CryptoSlotGuide. Message them on Telegram.
            </p>
            <a href={telegram} target="_blank" rel="noopener noreferrer" style={{ marginTop: "auto", alignSelf: "flex-start", padding: "10px 16px", borderRadius: 10, background: "#229ED9", color: "#fff", fontSize: 13.5, fontWeight: 800 }}>
              Message {vip.name} →
            </a>
          </div>
        )}

        <div style={card}>
          <span style={label}>Weekly email</span>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1.35 }}>RTP changes and the week&apos;s biggest races</div>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#A8B6BE" }}>One email a week: what changed at each casino, new races and raffles. Unsubscribe any time.</p>
          <a href={signupHref} style={{ marginTop: "auto", alignSelf: "flex-start", padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(0,194,204,.45)", color: "#5FE3E8", fontSize: 13.5, fontWeight: 800 }}>
            Join the email ↓
          </a>
        </div>
      </div>
    </section>
  );
}
