import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Package, MapPin, User, Phone, Truck } from "lucide-react";
import { Button, Spinner, Badge } from "@gotaxi/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { keys } from "@/lib/query-keys";
import { colisApi } from "@/lib/api/colis";
import { formatDate, formatCurrency } from "@/lib/format";
import type { ColisStatut } from "@/types/domain";

const statutConfig: Record<ColisStatut, { label: string; variant: "success" | "info" | "warning" | "error" | "neutral" }> = {
  EN_ATTENTE: { label: "En attente", variant: "warning" },
  CONFIRME: { label: "Confirmé", variant: "info" },
  EN_TRANSIT: { label: "En transit", variant: "info" },
  LIVRE: { label: "Livré", variant: "success" },
  ANNULE: { label: "Annulé", variant: "error" },
};

const TIMELINE: Array<{ statut: ColisStatut; label: string; icon: string }> = [
  { statut: "EN_ATTENTE", label: "En attente", icon: "📦" },
  { statut: "CONFIRME", label: "Confirmé", icon: "✅" },
  { statut: "EN_TRANSIT", label: "En transit", icon: "🚗" },
  { statut: "LIVRE", label: "Livré", icon: "🎉" },
];

const STATUT_ORDER: Record<ColisStatut, number> = {
  EN_ATTENTE: 0,
  CONFIRME: 1,
  EN_TRANSIT: 2,
  LIVRE: 3,
  ANNULE: -1,
};

export default function ColisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: colis, isLoading } = useQuery({
    queryKey: keys.colis.detail(id!),
    queryFn: () => colisApi.detail(id!),
    enabled: !!id,
  });

  if (isLoading) return <Spinner fullScreen />;
  if (!colis) return <p className="p-8 text-center text-muted-foreground">Colis introuvable</p>;

  const conf = statutConfig[colis.statut] ?? { label: colis.statut, variant: "neutral" as const };
  const currentStep = STATUT_ORDER[colis.statut];

  return (
    <>
      <PageHeader
        title={`Colis ${colis.code_suivi}`}
        subtitle={`${colis.ville_depart} → ${colis.ville_arrivee}`}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge label={conf.label} variant={conf.variant} dot />
            <Button variant="ghost" leftIcon={<ArrowLeft className="size-4" />} onClick={() => navigate(-1)}>
              Retour
            </Button>
          </div>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {colis.statut !== "ANNULE" && (
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="mb-4 text-sm font-bold">Progression</h3>
              <div className="flex items-center gap-0">
                {TIMELINE.map((step, i) => {
                  const done = currentStep >= i;
                  const active = currentStep === i;
                  return (
                    <div key={step.statut} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`flex size-8 items-center justify-center rounded-full text-sm
                            ${done ? "bg-primary text-white" : "bg-surface text-muted-foreground"}`}
                        >
                          {step.icon}
                        </div>
                        <p className={`text-2xs text-center ${active ? "font-bold text-primary" : "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                      </div>
                      {i < TIMELINE.length - 1 && (
                        <div className={`mx-1 h-0.5 flex-1 rounded-full ${currentStep > i ? "bg-primary" : "bg-border"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="mb-4 text-sm font-bold">Informations</h3>
            <dl className="space-y-3">
              <Detail icon={<Package className="size-4" />} label="Description" value={colis.description} />
              <Detail icon={<Package className="size-4" />} label="Catégorie" value={colis.categorie} />
              {colis.poids_kg && <Detail icon={<Package className="size-4" />} label="Poids" value={`${colis.poids_kg} kg`} />}
              <Detail icon={<MapPin className="size-4" />} label="Trajet" value={`${colis.ville_depart} → ${colis.ville_arrivee}`} />
              <Detail icon={<User className="size-4" />} label="Destinataire" value={colis.destinataire_nom} />
              <Detail icon={<Phone className="size-4" />} label="Téléphone" value={colis.destinataire_telephone} />
              <Detail icon={<Truck className="size-4" />} label="Paiement" value={colis.modalite_paiement.replace(/_/g, " ")} />
            </dl>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-sm font-bold">Prix</p>
            <p className="mt-2 text-2xl font-extrabold text-primary">{formatCurrency(colis.prix)}</p>
          </div>

          {colis.fragile && (
            <div className="rounded-2xl border border-warning/30 bg-warning-bg p-4">
              <p className="text-sm font-semibold text-warning-text">⚠ Colis fragile</p>
              <p className="text-xs text-warning-text/80 mt-0.5">
                Manipuler avec précaution
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-2xs text-muted-foreground font-bold uppercase tracking-wider">Référence</p>
            <p className="mt-1 font-mono text-base font-bold text-primary">{colis.code_suivi}</p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-2xs text-muted-foreground font-bold uppercase tracking-wider">Créé le</p>
            <p className="mt-1 text-sm">{formatDate(colis.created_at)}</p>
          </div>
        </div>
      </div>
    </>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <dt className="w-24 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}
