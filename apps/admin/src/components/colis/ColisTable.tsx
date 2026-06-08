import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatCurrency } from "@/lib/format";
import type { ColisRead, ColisStatut } from "@/types/domain";

const statutConfig: Record<ColisStatut, { label: string; variant: "success" | "error" | "warning" | "info" | "neutral" }> = {
  EN_ATTENTE: { label: "En attente", variant: "warning" },
  CONFIRME: { label: "Confirmé", variant: "info" },
  EN_TRANSIT: { label: "En transit", variant: "purple" as "info" },
  LIVRE: { label: "Livré", variant: "success" },
  ANNULE: { label: "Annulé", variant: "error" },
};

interface ColisTableProps {
  colis: ColisRead[];
  loading?: boolean;
  onRowClick?: (colis: ColisRead) => void;
}

export function ColisTable({ colis, loading, onRowClick }: ColisTableProps) {
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<ColisRead, unknown>[]>(
    () => [
      {
        accessorKey: "code_suivi",
        header: "Référence",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs font-bold text-primary">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ getValue }) => (
          <span className="text-sm max-w-[200px] truncate block">{getValue() as string}</span>
        ),
      },
      {
        id: "trajet",
        header: "Trajet",
        cell: ({ row }) => {
          const c = row.original;
          return (
            <span className="text-sm">
              {c.ville_depart} → {c.ville_arrivee}
            </span>
          );
        },
      },
      {
        accessorKey: "categorie",
        header: "Catégorie",
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: "prix",
        header: "Prix",
        cell: ({ getValue }) => (
          <span className="text-sm font-semibold">{formatCurrency(getValue() as number)}</span>
        ),
      },
      {
        accessorKey: "statut",
        header: "Statut",
        cell: ({ getValue }) => {
          const s = getValue() as ColisStatut;
          const conf = statutConfig[s] ?? { label: s, variant: "neutral" as const };
          return <StatusBadge label={conf.label} variant={conf.variant} dot />;
        },
      },
      {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">{formatDate(getValue() as string)}</span>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      data={colis}
      columns={columns}
      searchPlaceholder="Rechercher un colis..."
      onRowClick={onRowClick ?? ((c) => navigate(`/colis/${c.id}`))}
      loading={loading}
      emptyMessage="Aucun colis"
    />
  );
}
