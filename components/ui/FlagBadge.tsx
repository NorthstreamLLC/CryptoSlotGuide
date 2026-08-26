import type { Flag } from "@/lib/types";

export function FlagBadge({ flag }: { flag: Flag }) {
  return (
    <span
      className="inline-flex items-center rounded-chip px-2 py-0.5 font-mono text-[11px] font-medium"
      style={{ color: flag.color, background: flag.background }}
    >
      {flag.label}
    </span>
  );
}
