import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { DisputeCard } from "@/components/reviews/DisputeCard";
import { Button, Spinner } from "@gotaxi/ui";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import type { AvisRead } from "@/types/domain";

export default function DisputesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "avis", "disputes"],
    queryFn: () => get<AvisRead[]>("/admin/avis?signale=true"),
  });

  const disputes = (data ?? []).filter((a) => a.signale);

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
        <div className="mt-12 text-center">
          <p className="text-lg font-bold">Aucun litige en cours</p>
          <p className="text-sm text-muted-foreground mt-1">Tous les avis signalés ont été traités.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {disputes.map((avis) => (
            <DisputeCard
              key={avis.id}
              avis={avis}
              onArbitrate={(id) => console.log("Arbitrate:", id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
