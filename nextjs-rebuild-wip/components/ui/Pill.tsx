export function Pill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-pill border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
        active
          ? "border-transparent bg-accent-wash-strong text-accent-bright"
          : "border-border-strong text-text-secondary hover:text-text-primary"
      }`}
    >
      {label}
      {typeof count === "number" && (
        <span className="ml-1.5 font-mono text-text-dim">{count}</span>
      )}
    </button>
  );
}
