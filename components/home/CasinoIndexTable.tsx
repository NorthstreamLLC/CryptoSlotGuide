"use client";

import Link from "next/link";
import type { Operator } from "@/lib/types";
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
    label: "Payout",
    sortable: true,
    align: "right",
    sortValue: (o) => o.payout,
    render: (o) => o.payoutLabel,
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
