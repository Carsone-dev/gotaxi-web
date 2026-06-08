import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { ColisTable } from "@/components/colis/ColisTable";
import { Button } from "@gotaxi/ui";
import { Clock, Truck } from "lucide-react";
import { useAdminPendingColis, useAdminInTransitColis } from "@/hooks/useAdmin";

export default function ColisPage() {
  const { data: pending, isLoading: loadingPending } = useAdminPendingColis();
  const { data: inTransit, isLoading: loadingTransit } = useAdminInTransitColis();

  const allColis = [...(pending ?? []), ...(inTransit ?? [])];

  return (
    <>
      <PageHeader
        title="Colis"
        subtitle="Gestion des envois de colis"
        actions={
          <div className="flex gap-2">
            <Link to="/colis/pending">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Clock className="size-3.5" />}
              >
                En attente {pending && pending.length > 0 && `(${pending.length})`}
              </Button>
            </Link>
            <Link to="/colis/in-transit">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Truck className="size-3.5" />}
              >
                En transit {inTransit && inTransit.length > 0 && `(${inTransit.length})`}
              </Button>
            </Link>
          </div>
        }
      />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-warning/30 bg-warning-bg p-4">
          <p className="text-2xs font-bold uppercase tracking-wider text-warning-text">En attente</p>
          <p className="mt-1 text-2xl font-extrabold text-warning-text">{pending?.length ?? "—"}</p>
          <p className="text-xs text-warning-text/70">À valider</p>
        </div>
        <div className="rounded-2xl border border-info/30 bg-info-bg p-4">
          <p className="text-2xs font-bold uppercase tracking-wider text-info-text">En transit</p>
          <p className="mt-1 text-2xl font-extrabold text-info-text">{inTransit?.length ?? "—"}</p>
          <p className="text-xs text-info-text/70">En route</p>
        </div>
      </div>

      <div className="mt-6">
        <ColisTable
          colis={allColis}
          loading={loadingPending || loadingTransit}
        />
      </div>
    </>
  );
}
