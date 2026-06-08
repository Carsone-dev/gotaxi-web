import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { formatDateTime, formatCurrency } from "@/lib/format";
import type { VoyageRead, VoyageStatut } from "@/types/domain";

const statutConfig: Record<VoyageStatut, { label: string; variant: "success" | "info" | "warning" | "error" | "neutral" }> = {
  PUBLIE: { label: "Publié", variant: "info" },
  COMPLET: { label: "Complet", variant: "warning" },
  EN_COURS: { label: "En cours", variant: "success" },
  TERMINE: { label: "Terminé", variant: "neutral" },
  ANNULE: { label: "Annulé", variant: "error" },
};

export default function VoyagesPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "voyages"],
    queryFn: () => get<VoyageRead[]>("/admin/voyages"),
  });

  const voyages = data ?? [];

  const columns = useMemo<ColumnDef<VoyageRead, unknown>[]>(
    () => [
      {
        id: "trajet",
        header: "Trajet",
        cell: ({ row }) => {
          const v = row.original;
          return (
            <div>
              <p className="text-sm font-bold">{v.ville_depart} → {v.ville_arrivee}</p>
              <p className="text-xs text-muted-foreground">{v.point_depart}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "date_depart",
        header: "Départ",
        cell: ({ getValue }) => (
          <span className="text-sm">{formatDateTime(getValue() as string)}</span>
        ),
      },
      {
        accessorKey: "prix_par_place",
        header: "Prix/place",
        cell: ({ getValue }) => (
          <span className="text-sm font-semibold">{formatCurrency(getValue() as number)}</span>
        ),
      },
      {
        id: "places",
        header: "Places",
        cell: ({ row }) => {
          const v = row.original;
          return (
            <span className="text-sm">
              {v.nombre_places_restantes}/{v.nombre_places_total}
            </span>
          );
        },
      },
      {
        accessorKey: "accepte_colis",
        header: "Colis",
        cell: ({ getValue }) => (
          <span className="text-sm">{(getValue() as boolean) ? "✓" : "—"}</span>
        ),
      },
      {
        accessorKey: "statut",
        header: "Statut",
        cell: ({ getValue }) => {
          const s = getValue() as VoyageStatut;
          const conf = statutConfig[s] ?? { label: s, variant: "neutral" as const };
          return <StatusBadge label={conf.label} variant={conf.variant} dot />;
        },
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader title="Voyages" subtitle={`${voyages.length} voyages`} />
      <div className="mt-6">
        <DataTable
          data={voyages}
          columns={columns}
          searchPlaceholder="Rechercher un voyage..."
          onRowClick={(v) => navigate(`/voyages/${v.id}`)}
          loading={isLoading}
          emptyMessage="Aucun voyage"
        />
      </div>
    </>
  );
}
