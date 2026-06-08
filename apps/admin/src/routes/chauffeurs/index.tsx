import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@gotaxi/ui";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useAdminUsers } from "@/hooks/useAdmin";
import { formatDate, getInitials } from "@/lib/format";
import { Link } from "react-router-dom";
import type { UserRead } from "@/types/domain";

export default function ChauffeursPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useAdminUsers({ role: "CHAUFFEUR" });
  const chauffeurs = data ?? [];

  const kycPendingCount = chauffeurs.filter((c) => c.statut === "EN_ATTENTE_KYC").length;

  const columns = useMemo<ColumnDef<UserRead, unknown>[]>(
    () => [
      {
        accessorKey: "nom",
        header: "Chauffeur",
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center gap-3">
              {u.photo_url ? (
                <img src={u.photo_url} alt="" className="size-8 rounded-full object-cover ring-2 ring-border" />
              ) : (
                <div className="flex size-8 items-center justify-center rounded-full bg-surface text-xs font-bold ring-2 ring-border">
                  {getInitials(u.nom, u.prenom)}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold">{u.prenom} {u.nom}</p>
                <p className="text-xs text-muted-foreground">{u.telephone}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "statut",
        header: "KYC",
        cell: ({ getValue }) => {
          const s = getValue() as string;
          if (s === "ACTIF") return <StatusBadge label="Validé" variant="success" dot />;
          if (s === "EN_ATTENTE_KYC") return <StatusBadge label="En attente" variant="warning" dot />;
          if (s === "SUSPENDU") return <StatusBadge label="Suspendu" variant="error" dot />;
          return <StatusBadge label={s} variant="neutral" />;
        },
      },
      {
        accessorKey: "note_moyenne",
        header: "Note",
        cell: ({ getValue }) => (
          <span className="text-sm">⭐ {(getValue() as number).toFixed(1)}</span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Inscription",
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">{formatDate(getValue() as string)}</span>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Chauffeurs"
        subtitle={`${chauffeurs.length} chauffeurs`}
        actions={
          kycPendingCount > 0 ? (
            <Link to="/chauffeurs/kyc-pending">
              <Button variant="primary" leftIcon={<AlertTriangle className="size-4" />}>
                {kycPendingCount} KYC en attente
              </Button>
            </Link>
          ) : undefined
        }
      />

      <div className="mt-6">
        <DataTable
          data={chauffeurs}
          columns={columns}
          searchPlaceholder="Rechercher un chauffeur..."
          onRowClick={(c) => navigate(`/chauffeurs/${c.id}`)}
          loading={isLoading}
          emptyMessage="Aucun chauffeur"
        />
      </div>
    </>
  );
}
