"use client";

import Link from "next/link";
import type { Operator } from "@/lib/types";
import { payoutView } from "@/lib/payout";
import { Table, type Column } from "@/components/ui/Table";

const columns: Column<Operator>[] = [
  {
    key: "name",
    label: "Casino",
    sortable: true,
    sortValue: (o) => o.name,
    render: (o) => (
      <Link href={`/casinos/${o.slug}`} className="font-sans font-semibold text-text-primary hover:text-accent">
        {o.name}
      </Link>
    ),
  },
  {
    key: "score",
    label: "Score",
    sortable: true,
    align: "right",
    sortValue: (o) => o.score,
    render: (o) => <span className="text-accent-bright">{o.score.toFixed(1)}</span>,
  },
  {
    key: "payout",
    label: "Withdrawal time",
    sortable: true,
    align: "right",
    sortValue: (o) => payoutView(o).mins ?? Number.MAX_SAFE_INTEGER,
    render: (o) => payoutView(o).label,
  },
  {
    key: "wager",
    label: "Wagering",
    sortable: true,
    align: "right",
    sortValue: (o) => o.wager,
    render: (o) => (o.wager === 1 ? "None" : `${o.wager}x`),
  },
];

export function CasinoIndexTable({ operators }: { operators: Operator[] }) {
  return <Table columns={columns} rows={operators} rowKey={(o) => o.slug} />;
}
