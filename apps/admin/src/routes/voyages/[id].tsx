import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Calendar, Users, Package, Car } from "lucide-react";
import { Button, Spinner } from "@gotaxi/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { keys } from "@/lib/query-keys";
import { voyagesApi } from "@/lib/api/voyages";
import { formatDateTime, formatCurrency } from "@/lib/format";
import type { VoyageStatut } from "@/types/domain";

const statutConfig: Record<VoyageStatut, { label: string; variant: "success" | "info" | "warning" | "error" | "neutral" }> = {
  PUBLIE: { label: "Publié", variant: "info" },
  COMPLET: { label: "Complet", variant: "warning" },
  EN_COURS: { label: "En cours", variant: "success" },
  TERMINE: { label: "Terminé", variant: "neutral" },
  ANNULE: { label: "Annulé", variant: "error" },
};

export default function VoyageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: voyage, isLoading } = useQuery({
    queryKey: keys.voyages.detail(id!),
    queryFn: () => voyagesApi.detail(id!),
    enabled: !!id,
  });

  const { data: reservations } = useQuery({
    queryKey: keys.voyages.reservations(id!),
    queryFn: () => voyagesApi.reservations(id!),
    enabled: !!id,
  });

  if (isLoading) return <Spinner fullScreen />;
  if (!voyage) return <p className="p-8 text-center text-muted-foreground">Voyage introuvable</p>;

  const statut = statutConfig[voyage.statut] ?? { label: voyage.statut, variant: "neutral" as const };

  return (
    <>
      <PageHeader
        title={`${voyage.ville_depart} → ${voyage.ville_arrivee}`}
        subtitle={formatDateTime(voyage.date_depart)}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge label={statut.label} variant={statut.variant} dot />
            <Button variant="ghost" leftIcon={<ArrowLeft className="size-4" />} onClick={() => navigate(-1)}>
              Retour
            </Button>
          </div>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="mb-4 text-sm font-bold">Détails du voyage</h3>
            <dl className="grid grid-cols-2 gap-3">
              <Detail icon={<MapPin className="size-4" />} label="Départ" value={voyage.point_depart} />
              <Detail icon={<MapPin className="size-4" />} label="Arrivée" value={voyage.point_arrivee} />
              <Detail icon={<Calendar className="size-4" />} label="Date départ" value={formatDateTime(voyage.date_depart)} />
              {voyage.date_arrivee_estimee && (
                <Detail icon={<Calendar className="size-4" />} label="Arrivée estimée" value={formatDateTime(voyage.date_arrivee_estimee)} />
              )}
              <Detail icon={<Car className="size-4" />} label="Prix/place" value={formatCurrency(voyage.prix_par_place)} />
              <Detail
                icon={<Users className="size-4" />}
                label="Places"
                value={`${voyage.nombre_places_restantes} dispo / ${voyage.nombre_places_total} total`}
              />
              {voyage.distance_km && (
                <Detail icon={<MapPin className="size-4" />} label="Distance" value={`${voyage.distance_km} km`} />
              )}
              <div className="flex gap-3 text-sm">
                {voyage.climatise && <span className="rounded-full bg-info-bg px-2.5 py-1 text-xs font-semibold text-info-text">Climatisé</span>}
                {voyage.non_fumeur && <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">Non-fumeur</span>}
                {voyage.accepte_colis && <span className="rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-text">Accepte colis</span>}
              </div>
            </dl>
          </div>

          {reservations && reservations.length > 0 && (
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="mb-4 text-sm font-bold">Réservations ({reservations.length})</h3>
              <div className="space-y-2">
                {reservations.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {r.client?.prenom ?? "—"} {r.client?.nom ?? ""}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">{r.code_confirmation}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(r.prix_total)}</p>
                      <p className="text-xs text-muted-foreground">{r.nombre_places} place(s)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
