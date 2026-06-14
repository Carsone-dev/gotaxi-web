import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { PendingCard } from "@/components/colis/PendingCard";
import { Button, Spinner } from "@gotaxi/ui";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useAdminPendingColis } from "@/hooks/useAdmin";

export default function ColisPendingPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useAdminPendingColis();
  const pending = data ?? [];

  return (
    <>
      <PageHeader
        title="Colis en attente"
        subtitle={`${pending.length} colis à valider`}
        actions={
          <Link to="/colis">
            <Button variant="ghost" leftIcon={<ArrowLeft className="size-4" />}>
              Retour
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <Spinner className="mt-12" />
      ) : pending.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <CheckCircle className="size-12 text-primary opacity-40" />
          <p className="text-lg font-bold">Aucun colis en attente</p>
          <p className="text-sm text-muted-foreground">Tous les colis ont été traités.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pending.map((colis) => (
            <PendingCard key={colis.id} colis={colis} onViewDetail={() => navigate(`/colis/${colis.id}`)} />
          ))}
        </div>
      )}
    </>
  );
}
