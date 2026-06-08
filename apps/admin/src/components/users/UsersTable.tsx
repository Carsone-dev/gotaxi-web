import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { UserStatusBadge } from "./UserStatusBadge";
import { formatDate, formatPhoneNumber, getInitials } from "@/lib/format";
import type { UserRead } from "@/types/domain";

const roleLabel: Record<string, string> = {
  CLIENT: "Client",
  CHAUFFEUR: "Chauffeur",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};

interface UsersTableProps {
  users: UserRead[];
  loading?: boolean;
  onRowClick?: (user: UserRead) => void;
}

export function UsersTable({ users, loading, onRowClick }: UsersTableProps) {
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<UserRead, unknown>[]>(
    () => [
      {
        accessorKey: "nom",
        header: "Utilisateur",
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center gap-3">
              {u.photo_url ? (
                <img
                  src={u.photo_url}
                  alt=""
                  className="size-8 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div className="flex size-8 items-center justify-center rounded-full bg-surface text-xs font-bold text-muted-foreground ring-2 ring-border">
                  {getInitials(u.nom, u.prenom)}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold">{u.prenom} {u.nom}</p>
                <p className="text-xs text-muted-foreground">{formatPhoneNumber(u.telephone)}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Rôle",
        cell: ({ getValue }) => (
          <span className="text-sm">{roleLabel[getValue() as string] ?? getValue() as string}</span>
        ),
      },
      {
        accessorKey: "statut",
        header: "Statut",
        cell: ({ getValue }) => <UserStatusBadge statut={getValue() as UserRead["statut"]} />,
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
          <span className="text-sm text-muted-foreground">{formatDate(getValue() as string)}</span>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      data={users}
      columns={columns}
      searchPlaceholder="Rechercher un utilisateur..."
      onRowClick={onRowClick ?? ((u) => navigate(`/users/${u.id}`))}
      loading={loading}
      emptyMessage="Aucun utilisateur trouvé"
    />
  );
}
