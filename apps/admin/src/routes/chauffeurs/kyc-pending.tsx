import { useAdminUsers, useValidateKyc } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Spinner } from "@gotaxi/ui";
import { CheckCircle, XCircle, ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getInitials, formatDate } from "@/lib/format";

export default function KycPendingPage() {
  const { data, isLoading } = useAdminUsers({ statut: "EN_ATTENTE_KYC" });
  const validateKyc = useValidateKyc();

  const pending = (data ?? []).filter((u) => u.statut === "EN_ATTENTE_KYC");

  const handleValidate = async (userId: string, name: string) => {
    try {
      await validateKyc.mutateAsync(userId);
      toast.success(`KYC de ${name} validé`);
    } catch {
      toast.error("Erreur lors de la validation");
    }
  };

  return (
    <>
      <PageHeader
        title="KYC en attente"
        subtitle={`${pending.length} chauffeurs à valider`}
        actions={
          <Link to="/chauffeurs">
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
          <p className="text-lg font-bold">Tout est à jour !</p>
          <p className="text-sm text-muted-foreground">Aucun KYC en attente de validation.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pending.map((chauffeur) => (
            <div
              key={chauffeur.id}
              className="rounded-2xl border border-border bg-white p-5 shadow-soft"
            >
              <div className="flex items-start gap-4">
                {chauffeur.photo_url ? (
                  <img
                    src={chauffeur.photo_url}
                    alt=""
                    className="size-12 rounded-xl object-cover ring-2 ring-border"
                  />
                ) : (
                  <div className="flex size-12 items-center justify-center rounded-xl bg-surface text-lg font-bold text-muted-foreground ring-2 ring-border">
                    {getInitials(chauffeur.nom, chauffeur.prenom)}
                  </div>
                )}
                <div>
                  <p className="font-bold">{chauffeur.prenom} {chauffeur.nom}</p>
                  <p className="text-xs text-muted-foreground">{chauffeur.telephone}</p>
                  <p className="mt-1 text-2xs text-muted-foreground">
                    Inscrit le {formatDate(chauffeur.created_at)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-xl bg-surface p-3">
                <FileText className="size-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Documents soumis pour validation</span>
              </div>

              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  leftIcon={<CheckCircle className="size-4" />}
                  onClick={() => handleValidate(chauffeur.id, `${chauffeur.prenom} ${chauffeur.nom}`)}
                  loading={validateKyc.isPending}
                >
                  Valider
                </Button>
                <Link to={`/chauffeurs/${chauffeur.id}`}>
                  <Button variant="outline" size="sm">
                    Voir profil
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
