import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatCurrency, getMediaUrl } from "@/lib/format";
import type { ColisRead, ColisStatut } from "@/types/domain";

const statutConfig: Record<ColisStatut, { label: string; variant: "success" | "error" | "warning" | "info" | "neutral" }> = {
  EN_ATTENTE_PAIEMENT: { label: "Paiement en attente", variant: "warning" },
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
        id: "ref",
        header: "Référence",
        cell: ({ row }) => {
          const c = row.original;
          const photoUrl = getMediaUrl(c.photo_url);
          return (
            <div className="flex items-center gap-2.5">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt=""
                  className="size-10 rounded-xl object-cover shrink-0 border border-border"
                />
              ) : (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface border border-border">
                  <Package className="size-4 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-mono text-xs font-bold text-primary">{c.code_suivi}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[160px]">{c.description}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: "destinataire",
        header: "Destinataire",
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div>
              <p className="text-sm font-medium">{c.destinataire_nom}</p>
              <p className="text-xs text-muted-foreground">{c.destinataire_telephone}</p>
            </div>
          );
        },
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
