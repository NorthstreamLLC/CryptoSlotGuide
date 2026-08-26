import type { ScoreBar as ScoreBarData } from "@/lib/types";

export function ScoreBar({ bar }: { bar: ScoreBarData }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-[13px] text-text-secondary">{bar.name}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-raised">
        <div
          className="h-full rounded-full"
          style={{ width: `${bar.pct}%`, background: bar.color }}
        />
      </div>
      <span className="w-10 shrink-0 text-right font-mono text-[13px] font-medium text-text-primary">
        {bar.val.toFixed(1)}
      </span>
    </div>
  );
}
