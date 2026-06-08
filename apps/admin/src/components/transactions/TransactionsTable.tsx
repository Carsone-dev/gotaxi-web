import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime, formatCurrency } from "@/lib/format";
import type { TransactionRead, TransactionStatut, TransactionOperateur } from "@/types/domain";

const statutConfig: Record<TransactionStatut, { label: string; variant: "success" | "error" | "warning" | "neutral" }> = {
  REUSSI: { label: "Réussi", variant: "success" },
  EN_ATTENTE: { label: "En attente", variant: "warning" },
  ECHOUE: { label: "Échoué", variant: "error" },
  ANNULE: { label: "Annulé", variant: "neutral" },
};

const operatorColors: Record<TransactionOperateur, string> = {
  MTN: "bg-yellow-400",
  MOOV: "bg-sky-400",
  ORANGE: "bg-orange-400",
  WALLET: "bg-primary",
};

interface TransactionsTableProps {
  transactions: TransactionRead[];
  loading?: boolean;
}

export function TransactionsTable({ transactions, loading }: TransactionsTableProps) {
  const columns = useMemo<ColumnDef<TransactionRead, unknown>[]>(
    () => [
      {
        accessorKey: "operateur",
        header: "Opérateur",
        cell: ({ getValue }) => {
          const op = getValue() as TransactionOperateur;
          return (
            <div className="flex items-center gap-2">
              <span className={`size-2.5 rounded-full ${operatorColors[op] ?? "bg-muted"}`} />
              <span className="text-sm font-semibold">{op}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ getValue }) => (
          <span className="text-sm capitalize text-muted-foreground">
            {(getValue() as string).toLowerCase()}
          </span>
        ),
      },
      {
        accessorKey: "montant",
        header: "Montant",
        cell: ({ getValue }) => (
          <span className="text-sm font-bold">{formatCurrency(getValue() as number)}</span>
        ),
      },
      {
        accessorKey: "statut",
        header: "Statut",
        cell: ({ getValue }) => {
          const s = getValue() as TransactionStatut;
          const conf = statutConfig[s] ?? { label: s, variant: "neutral" as const };
          return <StatusBadge label={conf.label} variant={conf.variant} dot />;
        },
      },
      {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">{formatDateTime(getValue() as string)}</span>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      data={transactions}
      columns={columns}
      searchPlaceholder="Rechercher une transaction..."
      loading={loading}
      emptyMessage="Aucune transaction"
    />
  );
}
