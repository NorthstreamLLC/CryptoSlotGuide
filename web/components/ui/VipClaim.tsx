import vip from "@/data/vip.json";

function TelegramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" aria-hidden>
      <path d="M21.9 4.3 18.6 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.2-8.3c.4-.4-.1-.6-.6-.2L6 13.5l-4.9-1.5c-1.1-.3-1.1-1.1.2-1.6L20.6 3c.9-.3 1.7.2 1.3 1.3z" />
    </svg>
  );
}

/**
 * The code's welcome package is claimed through our VIP team, CasinoPerks, on
 * Telegram: signing up with the code alone does not pay it. Every place the
 * package is shown carries this button.
 */
export function VipClaim({ compact = false, label }: { compact?: boolean; label?: string }) {
  if (!vip.telegram) return null;
  return (
    <a
      href={vip.telegram}
      target="_blank"
      rel="noopener noreferrer"
      className="transition-transform hover:-translate-y-px"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: compact ? "8px 12px" : "12px 18px",
        borderRadius: compact ? 9 : 11,
        background: "#229ED9",
        color: "#fff",
        fontSize: compact ? 12.5 : 14.5,
        fontWeight: 800,
        whiteSpace: "nowrap",
        boxShadow: "0 8px 22px rgba(34,158,217,.28)",
      }}
    >
      <TelegramIcon size={compact ? 13 : 15} />
      {label ?? `Claim via ${vip.name} on Telegram`}
    </a>
  );
}

/** The one-line rule, said wherever the package is. */
export const CLAIM_NOTE = `Sign up with the code, then message ${vip.name}, the exclusive casino VIP team, on Telegram to claim the package.`;
