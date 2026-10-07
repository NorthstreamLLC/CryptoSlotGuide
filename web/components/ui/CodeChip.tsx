/**
 * A casino's referral code as a tap-to-copy chip. Server-rendered markup: the
 * copying is done by CodeCopier's one listener (data-copy-code), so lists of
 * forty rows stay server components.
 */
export function CodeChip({ code, tint = "#57E39A", size = "md", bare = false }: { code: string; tint?: string; size?: "sm" | "md"; bare?: boolean }) {
  const sm = size === "sm";
  return (
    <button
      type="button"
      data-copy-code={code}
      title={`Copy code ${code}`}
      aria-label={`Copy code ${code}`}
      className="csg-code-chip"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: sm ? 6 : 8,
        padding: sm ? "4px 8px" : "13px 16px",
        borderRadius: sm ? 7 : 11,
        border: `1px dashed ${tint}80`,
        background: `${tint}12`,
        color: "#DCE5E9",
        fontSize: sm ? 11 : 13.5,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {bare ? null : <>{sm ? "Code" : "Use code"} </>}
      <strong style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: sm ? 11.5 : 14.5, letterSpacing: ".04em", color: tint }}>{code}</strong>
      <svg width={sm ? 12 : 14} height={sm ? 12 : 14} viewBox="0 0 24 24" fill="none" stroke={tint} strokeWidth="2" aria-hidden>
        <rect x="9" y="9" width="12" height="12" rx="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
      </svg>
    </button>
  );
}
