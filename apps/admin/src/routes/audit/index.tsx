import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@gotaxi/ui";
import { useAuditLogs } from "@/hooks/useAdmin";
import { formatDateTime } from "@/lib/format";
import type { AuditLog } from "@/lib/api/admin";

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAuditLogs(page);

  const logs = data?.items ?? [];

  const columns = useMemo<ColumnDef<AuditLog, unknown>[]>(
    () => [
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs font-semibold text-primary">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: "target_type",
        header: "Cible",
        cell: ({ row }) => (
          <div>
            <span className="text-xs font-semibold">{row.original.target_type}</span>
            <p className="font-mono text-2xs text-muted-foreground">
              {row.original.target_id.slice(0, 8)}…
            </p>
          </div>
        ),
      },
      {
        accessorKey: "admin_id",
        header: "Admin",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {(getValue() as string).slice(0, 8)}…
          </span>
        ),
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
    <>
      <PageHeader
        title="Logs d'audit"
        subtitle={`${data?.total ?? 0} événements`}
      />

      <div className="mt-6">
        <DataTable
          data={logs}
          columns={columns}
          loading={isLoading}
          emptyMessage="Aucun log d'audit"
        />
      </div>

      {data && data.pages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-surface disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} / {data.pages}
          </span>
          <button
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-surface disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}
    </>
  );
}
