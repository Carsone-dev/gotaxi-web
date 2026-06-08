import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAdminReservations } from "@/hooks/useAdmin";
import { formatDateTime, formatCurrency, getInitials } from "@/lib/format";
import type { ReservationRead, ReservationStatut } from "@/types/domain";

const STATUT_CONFIG: Record<ReservationStatut, { label: string; variant: "success" | "info" | "warning" | "error" | "neutral" }> = {
  EN_ATTENTE: { label: "En attente", variant: "warning" },
  CONFIRMEE: { label: "Confirmée", variant: "success" },
  REFUSEE: { label: "Refusée", variant: "error" },
  ANNULEE: { label: "Annulée", variant: "neutral" },
  TERMINEE: { label: "Terminée", variant: "info" },
};

const FILTRES: { label: string; value: ReservationStatut | undefined }[] = [
  { label: "Toutes", value: undefined },
  { label: "En attente", value: "EN_ATTENTE" },
  { label: "Confirmées", value: "CONFIRMEE" },
  { label: "Terminées", value: "TERMINEE" },
  { label: "Annulées", value: "ANNULEE" },
  { label: "Refusées", value: "REFUSEE" },
];

export default function ReservationsPage() {
  const navigate = useNavigate();
  const [statut, setStatut] = useState<ReservationStatut | undefined>(undefined);

  const { data, isLoading } = useAdminReservations({ statut, size: 100 });
  const reservations = data?.items ?? [];

  const columns = useMemo<ColumnDef<ReservationRead, unknown>[]>(
    () => [
      {
        accessorKey: "code_confirmation",
        header: "Code",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs font-bold text-primary">{getValue() as string}</span>
        ),
      },
      {
        id: "client",
        header: "Client",
        cell: ({ row }) => {
          const c = row.original.client;
          if (!c) return <span className="text-xs text-muted-foreground">—</span>;
          return (
            <div className="flex items-center gap-2.5">
              {c.photo_url ? (
                <img src={c.photo_url} alt="" className="size-7 rounded-lg object-cover" />
              ) : (
                <div className="flex size-7 items-center justify-center rounded-lg bg-surface text-2xs font-bold text-muted-foreground">
                  {getInitials(c.nom, c.prenom)}
                </div>
              )}
              <span className="text-sm font-medium">{c.prenom} {c.nom}</span>
            </div>
          );
        },
      },
      {
        id: "trajet",
        header: "Trajet",
        cell: ({ row }) => {
          const v = row.original.voyage;
          if (!v) return <span className="text-xs text-muted-foreground">—</span>;
          return (
            <div>
              <p className="text-sm font-semibold">{v.ville_depart} → {v.ville_arrivee}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(v.date_depart)}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "nombre_places",
        header: "Places",
        cell: ({ getValue }) => (
          <span className="text-sm">{getValue() as number} pl.</span>
        ),
      },
      {
        accessorKey: "prix_total",
        header: "Prix total",
        cell: ({ getValue }) => (
          <span className="text-sm font-semibold">{formatCurrency(getValue() as number)}</span>
        ),
      },
      {
        accessorKey: "statut",
        header: "Statut",
        cell: ({ getValue }) => {
          const s = getValue() as ReservationStatut;
          const conf = STATUT_CONFIG[s] ?? { label: s, variant: "neutral" as const };
          return <StatusBadge label={conf.label} variant={conf.variant} dot />;
        },
      },
      {
        accessorKey: "created_at",
        header: "Créée le",
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">{formatDateTime(getValue() as string)}</span>
        ),
      },
    ],
    [],
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of reservations) {
      map[r.statut] = (map[r.statut] ?? 0) + 1;
    }
    return map;
  }, [reservations]);

  return (
    <>
      <PageHeader
        title="Réservations"
        subtitle={`${data?.total ?? 0} réservation(s) au total`}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTRES.map((f) => {
          const count = f.value ? counts[f.value] : reservations.length;
          return (
            <button
              key={f.label}
              onClick={() => setStatut(f.value)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                statut === f.value
                  ? "bg-ink text-white"
                  : "border border-border text-muted-foreground hover:text-ink"
              }`}
            >
              {f.label}
              {count != null && count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-2xs font-bold ${
                  statut === f.value ? "bg-white/20" : "bg-surface text-ink"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <DataTable
          data={reservations}
          columns={columns}
          searchPlaceholder="Rechercher par code, client, trajet…"
          onRowClick={(r) => r.voyage_id && navigate(`/voyages/${r.voyage_id}`)}
          loading={isLoading}
          emptyMessage="Aucune réservation pour ce filtre"
          pageSize={15}
        />
      </div>
    </>
  );
}
