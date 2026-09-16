"use client";

import { wagerView } from "@/lib/wager";
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
    key: "licence",
    label: "Licence",
    sortable: true,
    align: "right",
    sortValue: (o) => o.licence,
    render: (o) => o.licence,
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
    sortValue: (o) => wagerView(o).mult ?? Number.MAX_SAFE_INTEGER,
    render: (o) => wagerView(o).label,
  },
];

/** Rows start in alphabetical order; no default ranking. */
export function CasinoIndexTable({ operators }: { operators: Operator[] }) {
  const rows = [...operators].sort((a, b) => a.name.localeCompare(b.name));
  return <Table columns={columns} rows={rows} rowKey={(o) => o.slug} />;
}
