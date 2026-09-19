/**
 * "Not sure which casinos you can use?" contact box. Renders only once
 * NEXT_PUBLIC_TELEGRAM_URL is set, so no dead link ships before the channel exists.
 */
export function HelpBox() {
  const url = process.env.NEXT_PUBLIC_TELEGRAM_URL;
  if (!url) return null;
  return (
    <section style={{ marginTop: 28, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "22px 26px", borderRadius: 18, background: "radial-gradient(120% 120% at 100% 0%, rgba(42,171,238,.14), transparent 55%), #0C1013", border: "1px solid rgba(42,171,238,.3)" }}>
      <div style={{ maxWidth: "62ch" }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Not sure which casinos you can use?</div>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "#A8B6BE" }}>
          Questions about KYC, verification or which casinos accept players where you live? Message us on Telegram and we&apos;ll point you to the right option.
        </p>
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 20px", borderRadius: 11, background: "#2AABEE", color: "#fff", fontSize: 14.5, fontWeight: 800, whiteSpace: "nowrap" }}>
        Message us on Telegram →
      </a>
    </section>
  );
}
