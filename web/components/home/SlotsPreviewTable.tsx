"use client";

import Link from "next/link";
import { Table, type Column } from "@/components/ui/Table";

/**
 * The homepage slots table: the editorial picks, in their order, with the
 * figures topSlotRows() resolves for each (the studio's own where we hold
 * them, the catalogue's otherwise) and the game's tile.
 */
export interface PreviewSlot {
  slug: string;
  rank: number;
  name: string;
  provider: string;
  rtp: string;
  volatility: string;
  maxWin: string;
  versions: number;
  image: string | null;
}

const VOL_STYLE: Record<string, { bg: string; color: string }> = {
  low: { bg: "rgba(0,194,204,.12)", color: "#5FE3E8" },
  medium: { bg: "rgba(0,194,204,.12)", color: "#5FE3E8" },
  high: { bg: "rgba(255,255,255,.06)", color: "#B7C4CB" },
  "very-high": { bg: "rgba(214,182,92,.14)", color: "#D6B65C" },
  "very high": { bg: "rgba(214,182,92,.14)", color: "#D6B65C" },
  extreme: { bg: "rgba(196,101,58,.16)", color: "#DA9877" },
};

const num = (v: string) => Number(v.replace(/[^0-9.]/g, "")) || 0;

const columns: Column<PreviewSlot>[] = [
  {
    key: "rank",
    label: "#",
    sortable: true,
    sortValue: (s) => s.rank,
    render: (s) => <span className="font-mono text-[12px] text-text-dim-2">{s.rank}</span>,
  },
  {
    key: "name",
    label: "Slot",
    sortable: true,
    sortValue: (s) => s.name,
    render: (s) => (
      <Link href={`/slots/${s.slug}`} className="inline-flex items-center gap-3 font-sans font-semibold text-text-primary hover:text-accent">
        {s.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.image} alt="" width={56} height={34} loading="lazy" className="flex-none rounded-md object-cover" style={{ width: 56, height: 34, border: "1px solid rgba(255,255,255,.08)" }} />
        ) : (
          <span className="flex flex-none items-center justify-center rounded-md font-mono text-[9px] font-bold text-[#0A0D0F]" style={{ width: 56, height: 34, background: "#5FE3E8" }}>
            {s.name.split(/\s+/).slice(0, 3).map((w) => w[0]).join("").toUpperCase()}
          </span>
        )}
        {s.name}
      </Link>
    ),
  },
  {
    key: "provider",
    label: "Provider",
    sortable: true,
    sortValue: (s) => s.provider,
    render: (s) => s.provider,
  },
  {
    key: "rtp",
    label: "RTP",
    sortable: true,
    align: "right",
    sortValue: (s) => num(s.rtp),
    // The best published build; the versions column gives the count.
    render: (s) => <span className="text-text-primary">{s.rtp.split(" – ")[0]}</span>,
  },
  {
    key: "vol",
    label: "Volatility",
    render: (s) => {
      if (/^not /i.test(s.volatility)) return <span className="font-mono text-[10px] text-text-dim-2">Not published</span>;
      const style = VOL_STYLE[s.volatility.toLowerCase()] ?? VOL_STYLE.high;
      return (
        <span className="whitespace-nowrap rounded font-mono text-[10px] tracking-[.04em]" style={{ padding: "3px 8px", background: style.bg, color: style.color }}>
          {s.volatility.toLowerCase()}
        </span>
      );
    },
  },
  {
    key: "maxWin",
    label: "Max win",
    sortable: true,
    align: "right",
    sortValue: (s) => (/^not /i.test(s.maxWin) ? -1 : num(s.maxWin)),
    render: (s) => s.maxWin,
  },
  {
    key: "versions",
    label: "RTP versions",
    render: (s) => <span style={{ color: "#B7C4CB" }}>{s.versions > 1 ? s.versions : "—"}</span>,
  },
];

export function SlotsPreviewTable({ slots }: { slots: PreviewSlot[] }) {
  return <Table columns={columns} rows={slots} rowKey={(s) => s.slug} minWidth={860} />;
}
