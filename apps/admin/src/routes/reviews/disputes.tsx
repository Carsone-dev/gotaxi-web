import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { DisputeCard } from "@/components/reviews/DisputeCard";
import { Button, Spinner } from "@gotaxi/ui";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useAdminAvis, useMasquerAvis, useRestaureAvis } from "@/hooks/useAdmin";
import { toast } from "sonner";

export default function DisputesPage() {
  const { data, isLoading } = useAdminAvis({ signale: true, size: 100 });

  const masquer = useMasquerAvis();
  const restaurer = useRestaureAvis();

  const disputes = data?.items ?? [];

  async function handleMasquer(id: string) {
    try {
      await masquer.mutateAsync(id);
      toast.success("Avis masqué");
    } catch {
      toast.error("Erreur");
    }
  }

  async function handleRestaurer(id: string) {
    try {
      await restaurer.mutateAsync(id);
      toast.success("Avis restauré");
    } catch {
      toast.error("Erreur");
    }
  }

  return (
    <>
      <PageHeader
        title="Litiges"
        subtitle={`${disputes.length} avis signalés`}
        actions={
          <Link to="/reviews">
            <Button variant="ghost" leftIcon={<ArrowLeft className="size-4" />}>
              Retour
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <Spinner className="mt-12" />
      ) : disputes.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-success-bg">
            <CheckCircle className="size-7 text-success" />
          </div>
          <p className="text-lg font-bold">Aucun litige en cours</p>
          <p className="text-sm text-muted-foreground">Tous les avis signalés ont été traités.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {disputes.map((avis) => (
            <DisputeCard
              key={avis.id}
              avis={avis}
              onMasquer={handleMasquer}
              onRestaurer={handleRestaurer}
              isLoading={masquer.isPending || restaurer.isPending}
            />
          ))}
        </div>
      )}
    </>
  );
}
