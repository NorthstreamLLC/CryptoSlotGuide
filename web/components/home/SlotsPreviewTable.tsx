"use client";

import Link from "next/link";
import { hasMaxWin, hasVol, maxWinLabel, rtpLabel, rtpSortValue } from "@/lib/slot-facts";
import type { Slot } from "@/lib/types";
import { Table, type Column } from "@/components/ui/Table";

const VOL_STYLE: Record<Slot["vol"], { bg: string; color: string }> = {
  low: { bg: "rgba(0,194,204,.12)", color: "#5FE3E8" },
  medium: { bg: "rgba(0,194,204,.12)", color: "#5FE3E8" },
  high: { bg: "rgba(255,255,255,.06)", color: "#B7C4CB" },
  "very-high": { bg: "rgba(214,182,92,.14)", color: "#D6B65C" },
  extreme: { bg: "rgba(196,101,58,.16)", color: "#DA9877" },
};

const columns: Column<Slot>[] = [
  {
    key: "name",
    label: "Slot",
    sortable: true,
    sortValue: (s) => s.name,
    render: (s) => (
      <Link href={`/slots/${s.slug}`} className="inline-flex items-center gap-2.5 font-sans font-semibold text-text-primary hover:text-accent">
        <span
          className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-md font-mono text-[8.5px] font-bold text-[#0A0D0F]"
          style={{ background: s.tint }}
        >
          {s.mono}
        </span>
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
    sortValue: (s) => rtpSortValue(s),
    render: (s) => <span className="text-text-primary">{rtpLabel(s)}</span>,
  },
  {
    key: "vol",
    label: "Volatility",
    render: (s) => {
      if (!hasVol(s)) return <span className="font-mono text-[10px] text-text-dim-2">Not published</span>;
      const style = VOL_STYLE[s.vol];
      return (
        <span
          className="whitespace-nowrap rounded font-mono text-[10px] tracking-[.04em]"
          style={{ padding: "3px 8px", background: style.bg, color: style.color }}
        >
          {s.vol}
        </span>
      );
    },
  },
  {
    key: "maxWin",
    label: "Max win",
    sortable: true,
    align: "right",
    sortValue: (s) => (hasMaxWin(s) ? Number(String(s.maxWin).replace(/[^0-9.]/g, "")) || 0 : -1),
    render: (s) => maxWinLabel(s),
  },
  {
    key: "versions",
    label: "RTP versions",
    render: (s) => <span style={{ color: "#B7C4CB" }}>{s.rtpVersions ? s.rtpVersions.split("/").length : "—"}</span>,
  },
];

export function SlotsPreviewTable({ slots }: { slots: Slot[] }) {
  return <Table columns={columns} rows={slots} rowKey={(s) => s.slug} minWidth={820} />;
}
