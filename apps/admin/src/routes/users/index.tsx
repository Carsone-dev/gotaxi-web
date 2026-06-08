import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { UsersTable } from "@/components/users/UsersTable";
import { UserDetailDrawer } from "@/components/users/UserDetailDrawer";
import { useAdminUsers } from "@/hooks/useAdmin";
import { Button } from "@gotaxi/ui";
import { Download } from "lucide-react";
import type { UserRead } from "@/types/domain";

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<UserRead | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statutFilter, setStatutFilter] = useState<string>("");

  const { data, isLoading } = useAdminUsers({
    role: roleFilter || undefined,
    statut: statutFilter || undefined,
  });

  const users = data ?? [];

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        subtitle={`${users.length} utilisateurs`}
        actions={
          <Button variant="outline" size="sm" leftIcon={<Download className="size-3.5" />}>
            Exporter CSV
          </Button>
        }
      />

      <div className="mt-4 flex gap-3">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none"
        >
          <option value="">Tous les rôles</option>
          <option value="CLIENT">Client</option>
          <option value="CHAUFFEUR">Chauffeur</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>

        <select
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value)}
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none"
        >
          <option value="">Tous les statuts</option>
          <option value="ACTIF">Actif</option>
          <option value="SUSPENDU">Suspendu</option>
          <option value="EN_ATTENTE_KYC">KYC en attente</option>
          <option value="SUPPRIME">Supprimé</option>
        </select>
      </div>

      <div className="mt-4">
        <UsersTable
          users={users}
          loading={isLoading}
          onRowClick={setSelectedUser}
        />
      </div>

      {selectedUser && (
        <UserDetailDrawer
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
}
