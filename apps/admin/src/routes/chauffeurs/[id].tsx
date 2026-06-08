import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Car, CheckCircle, XCircle } from "lucide-react";
import { Button, Spinner, Badge } from "@gotaxi/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { useValidateKyc } from "@/hooks/useAdmin";
import { keys } from "@/lib/query-keys";
import { usersApi } from "@/lib/api/users";
import { chauffeursApi } from "@/lib/api/chauffeurs";
import { formatDate, getInitials, formatCurrency } from "@/lib/format";
import { toast } from "sonner";

export default function ChauffeurDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const validateKyc = useValidateKyc();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: keys.users.detail(id!),
    queryFn: () => usersApi.publicProfile(id!),
    enabled: !!id,
  });

  const { data: chauffeur, isLoading: chauffeurLoading } = useQuery({
    queryKey: keys.chauffeurs.detail(id!),
    queryFn: () => chauffeursApi.publicProfile(id!),
    enabled: !!id,
  });

  if (userLoading || chauffeurLoading) return <Spinner fullScreen />;
  if (!user) return <p className="p-8 text-center text-muted-foreground">Chauffeur introuvable</p>;

  const handleValidateKyc = async () => {
    try {
      await validateKyc.mutateAsync(id!);
      toast.success("KYC validé");
    } catch {
      toast.error("Erreur lors de la validation");
    }
  };

  return (
    <>
      <PageHeader
        title={`${user.prenom} ${user.nom}`}
        subtitle="Profil chauffeur"
        actions={
          <Button variant="ghost" leftIcon={<ArrowLeft className="size-4" />} onClick={() => navigate(-1)}>
            Retour
          </Button>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="flex items-center gap-5 rounded-2xl border border-border bg-white p-5">
            {user.photo_url ? (
              <img src={user.photo_url} alt="" className="size-20 rounded-2xl object-cover ring-2 ring-border" />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-2xl bg-surface text-2xl font-extrabold ring-2 ring-border">
                {getInitials(user.nom, user.prenom)}
              </div>
            )}
            <div>
              <h2 className="text-xl font-extrabold">{user.prenom} {user.nom}</h2>
              <p className="text-sm text-muted-foreground">{user.telephone}</p>
              <div className="mt-2 flex gap-2">
                <UserStatusBadge statut={user.statut} />
                {chauffeur?.kyc_valide ? (
                  <Badge variant="success">KYC validé</Badge>
                ) : (
                  <Badge variant="warning">KYC en attente</Badge>
                )}
              </div>
            </div>
          </div>

          {chauffeur && (
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="mb-4 text-sm font-bold">Stats chauffeur</h3>
              <div className="grid grid-cols-3 gap-4">
                <StatBox label="Trajets" value={chauffeur.nombre_trajets} />
                <StatBox label="Revenus total" value={formatCurrency(chauffeur.revenus_total)} />
                <StatBox label="Note" value={`⭐ ${user.note_moyenne.toFixed(1)}`} />
              </div>
            </div>
          )}

          {chauffeur?.vehicules && chauffeur.vehicules.length > 0 && (
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="mb-4 text-sm font-bold">Véhicules</h3>
              <div className="space-y-3">
                {chauffeur.vehicules.map((v) => (
                  <div key={v.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-surface">
                      <Car className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{v.marque} {v.modele} {v.annee}</p>
                      <p className="text-xs text-muted-foreground">
                        {v.immatriculation} · {v.couleur} · {v.nombre_places} places
                        {v.climatise && " · Climatisé"}
                      </p>
                    </div>
                    {v.actif && <Badge variant="success">Actif</Badge>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {chauffeur && !chauffeur.kyc_valide && (
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm font-bold">Validation KYC</p>
              <div className="mt-3 space-y-2">
                <Button
                  className="w-full"
                  leftIcon={<CheckCircle className="size-4" />}
                  onClick={handleValidateKyc}
                  loading={validateKyc.isPending}
                >
                  Valider le KYC
                </Button>
              </div>
            </div>
          )}

          {chauffeur && (
            <div className="rounded-2xl border border-border bg-white p-4 space-y-2">
              <p className="text-sm font-bold">Informations KYC</p>
              <KycRow label="CIN" value={chauffeur.cin_numero ?? "Non fourni"} />
              <KycRow label="Permis" value={chauffeur.permis_numero ?? "Non fourni"} />
              <KycRow
                label="Expiration permis"
                value={chauffeur.permis_expiration ? formatDate(chauffeur.permis_expiration) : "—"}
              />
              <KycRow
                label="Transfrontalier"
                value={chauffeur.autorisation_transfrontaliere ? "Oui" : "Non"}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StatBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border p-3 text-center">
      <p className="text-lg font-extrabold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function KycRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
