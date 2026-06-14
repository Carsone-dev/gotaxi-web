import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Calendar, Users, Car, XCircle, Phone,
  Banknote, Package, Wind, Cigarette, Hash,
} from "lucide-react";
import { Button, Spinner } from "@gotaxi/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { useAdminVoyageDetail, useCancelVoyage } from "@/hooks/useAdmin";
import { formatDate, formatDateTime, formatCurrency, formatPhoneNumber, getInitials, getMediaUrl } from "@/lib/format";
import { toast } from "sonner";
import type { VoyageStatut, ReservationStatut } from "@/types/domain";

const STATUT_CONFIG: Record<VoyageStatut, { label: string; variant: "success" | "info" | "warning" | "error" | "neutral" }> = {
  PUBLIE:   { label: "Publié",   variant: "info"    },
  COMPLET:  { label: "Complet",  variant: "warning" },
  EN_COURS: { label: "En cours", variant: "success" },
  TERMINE:  { label: "Terminé",  variant: "neutral" },
  ANNULE:   { label: "Annulé",   variant: "error"   },
};

const RESA_STATUT: Record<ReservationStatut, { label: string; variant: "success" | "info" | "warning" | "error" | "neutral" }> = {
  EN_ATTENTE: { label: "En attente",  variant: "warning" },
  CONFIRMEE:  { label: "Confirmée",   variant: "success" },
  ANNULEE:    { label: "Annulée",     variant: "error"   },
  TERMINEE:   { label: "Terminée",    variant: "neutral" },
};

const CANCELLABLE: VoyageStatut[] = ["PUBLIE", "COMPLET", "EN_COURS"];

const TYPE_VEHICULE_LABELS: Record<string, string> = {
  BERLINE:     "Berline",
  SUV:         "SUV",
  MINIBUS:     "Minibus",
  BUS:         "Bus",
  PICKUP:      "Pick-up",
  MOTO:        "Moto",
};

export default function VoyageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const { data: detail, isLoading } = useAdminVoyageDetail(id!);
  const cancelMutation = useCancelVoyage();

  if (isLoading) return <Spinner fullScreen />;
  if (!detail) return <p className="p-8 text-center text-muted-foreground">Voyage introuvable</p>;

  const { voyage, reservations, chauffeur, vehicule } = detail;
  const statut = STATUT_CONFIG[voyage.statut] ?? { label: voyage.statut, variant: "neutral" as const };
  const canCancel = CANCELLABLE.includes(voyage.statut);
  const placesVendues = voyage.nombre_places_total - voyage.nombre_places_restantes;

  const fillPct = voyage.nombre_places_total > 0
    ? Math.round((placesVendues / voyage.nombre_places_total) * 100)
    : 0;
  const fillColor =
    fillPct >= 100 ? "bg-error" :
    fillPct >= 75  ? "bg-success" :
    fillPct >= 40  ? "bg-warning-text" : "bg-primary/40";

  const revenusConfirmes = reservations
    .filter((r) => r.statut === "CONFIRMEE" || r.statut === "TERMINEE")
    .reduce((acc, r) => acc + r.prix_total, 0);

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    try {
      await cancelMutation.mutateAsync({ voyageId: id!, reason: cancelReason });
      toast.success("Voyage annulé");
      setShowCancel(false);
      setCancelReason("");
    } catch {
      toast.error("Erreur lors de l'annulation");
    }
  };

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

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">

        {/* ── Colonne principale ────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Chauffeur */}
          {chauffeur ? (
            <div
              className="flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-white p-4 transition-colors hover:bg-surface"
              onClick={() => navigate(`/chauffeurs/${chauffeur.id}`)}
            >
              {chauffeur.photo_url ? (
                <img src={getMediaUrl(chauffeur.photo_url) ?? ""} alt="" className="size-12 rounded-xl object-cover ring-2 ring-border" />
              ) : (
                <div className="flex size-12 items-center justify-center rounded-xl bg-surface text-base font-bold ring-2 ring-border">
                  {getInitials(chauffeur.nom, chauffeur.prenom)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">{chauffeur.prenom} {chauffeur.nom}</p>
                  <UserStatusBadge statut={chauffeur.statut} />
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Phone className="size-3" />{formatPhoneNumber(chauffeur.telephone)}
                </p>
              </div>
              <Car className="size-4 shrink-0 text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm text-muted-foreground">Chauffeur non trouvé</p>
            </div>
          )}

          {/* Véhicule */}
          {vehicule && (
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                <Car className="size-4 text-muted-foreground" />
                Véhicule
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Detail icon={<Car className="size-4" />}      label="Marque / Modèle"  value={`${vehicule.marque} ${vehicule.modele}`} />
                <Detail icon={<Hash className="size-4" />}     label="Immatriculation"  value={vehicule.immatriculation} />
                <Detail icon={<Calendar className="size-4" />} label="Année"            value={String(vehicule.annee)} />
                <Detail icon={<Car className="size-4" />}      label="Type"             value={TYPE_VEHICULE_LABELS[vehicule.type_vehicule] ?? vehicule.type_vehicule} />
                <Detail icon={<Users className="size-4" />}    label="Places totales"   value={String(vehicule.nombre_places)} />
                {vehicule.couleur && (
                  <Detail icon={<Car className="size-4" />} label="Couleur" value={vehicule.couleur} />
                )}
              </div>
              {vehicule.climatise && (
                <div className="mt-3 flex gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                    <Wind className="size-3" /> Climatisé
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Détails du voyage */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="mb-4 text-sm font-bold">Détails du voyage</h3>
            <dl className="grid grid-cols-2 gap-3">
              <Detail icon={<MapPin className="size-4" />}    label="Départ"          value={voyage.point_depart} />
              <Detail icon={<MapPin className="size-4" />}    label="Arrivée"         value={voyage.point_arrivee} />
              <Detail icon={<Calendar className="size-4" />}  label="Date départ"     value={formatDateTime(voyage.date_depart)} />
              {voyage.date_arrivee_estimee && (
                <Detail icon={<Calendar className="size-4" />} label="Arrivée estimée" value={formatDateTime(voyage.date_arrivee_estimee)} />
              )}
              <Detail icon={<Banknote className="size-4" />}  label="Prix / place"    value={formatCurrency(voyage.prix_par_place)} />
              <Detail
                icon={<Users className="size-4" />}
                label="Places"
                value={`${voyage.nombre_places_restantes} dispo / ${voyage.nombre_places_total} total`}
              />
              {voyage.distance_km != null && (
                <Detail icon={<MapPin className="size-4" />} label="Distance" value={`${voyage.distance_km} km`} />
              )}
            </dl>

            {/* Options */}
            <div className="mt-4 flex flex-wrap gap-2">
              {voyage.climatise && (
                <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  <Wind className="size-3" /> Climatisé
                </span>
              )}
              {voyage.accepte_colis && (
                <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                  <Package className="size-3" /> Accepte colis
                </span>
              )}
              {voyage.non_fumeur && (
                <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                  <Cigarette className="size-3" /> Non-fumeur
                </span>
              )}
            </div>
          </div>

          {/* Réservations */}
          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h3 className="text-sm font-bold">
                Réservations{" "}
                <span className="font-normal text-muted-foreground">({reservations.length})</span>
              </h3>
            </div>
            {reservations.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">Aucune réservation</p>
            ) : (
              <div className="divide-y divide-border">
                {reservations.map((r) => {
                  const resaStatut = RESA_STATUT[r.statut] ?? { label: r.statut, variant: "neutral" as const };
                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface transition-colors cursor-pointer"
                      onClick={() => navigate(`/reservations/${r.id}`)}
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface text-xs font-bold">
                        {getInitials(r.client?.nom ?? "?", r.client?.prenom ?? "")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">
                          {r.client?.prenom ?? "—"} {r.client?.nom ?? ""}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">{r.code_confirmation}</p>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <StatusBadge label={resaStatut.label} variant={resaStatut.variant} dot />
                        <p className="text-sm font-bold">{formatCurrency(r.prix_total)}</p>
                        <p className="text-xs text-muted-foreground">{r.nombre_places} place{r.nombre_places > 1 ? "s" : ""}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div className="space-y-3">

          {/* Actions */}
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-sm font-bold mb-3">Actions admin</p>

            {canCancel ? (
              <>
                {!showCancel ? (
                  <button
                    onClick={() => setShowCancel(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-error/30 py-2.5 text-sm font-semibold text-error transition-colors hover:bg-error/5"
                  >
                    <XCircle className="size-4" />
                    Annuler le voyage
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Cette action annulera le voyage et toutes ses réservations.
                    </p>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Motif d'annulation (requis)…"
                      rows={3}
                      className="w-full resize-none rounded-xl border border-border px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    {cancelMutation.isError && (
                      <p className="text-xs text-error">Une erreur est survenue. Réessayez.</p>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={handleCancel}
                      disabled={!cancelReason.trim()}
                      loading={cancelMutation.isPending}
                    >
                      Confirmer l'annulation
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => { setShowCancel(false); setCancelReason(""); }}
                    >
                      Retour
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune action disponible pour un voyage {statut.label.toLowerCase()}.
              </p>
            )}
          </div>

          {/* Taux de remplissage */}
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-sm font-bold mb-3">Remplissage</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-extrabold text-ink">{fillPct}%</span>
              <span className="text-sm text-muted-foreground">{placesVendues} / {voyage.nombre_places_total} places</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface">
              <div
                className={`h-full rounded-full transition-all ${fillColor}`}
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </div>

          {/* Récapitulatif revenus */}
          <div className="rounded-2xl border border-border bg-white p-4 space-y-2.5">
            <p className="text-sm font-bold">Revenus</p>
            <SummaryRow label="Prix / place"   value={formatCurrency(voyage.prix_par_place)} />
            <SummaryRow label="Places vendues" value={`${placesVendues} / ${voyage.nombre_places_total}`} />
            <SummaryRow
              label="Revenu estimé"
              value={formatCurrency(placesVendues * voyage.prix_par_place)}
            />
            {revenusConfirmes > 0 && (
              <SummaryRow
                label="Confirmé"
                value={formatCurrency(revenusConfirmes)}
                highlight
              />
            )}
          </div>

          {/* Récapitulatif */}
          <div className="rounded-2xl border border-border bg-white p-4 space-y-2.5">
            <p className="text-sm font-bold">Récapitulatif</p>
            <SummaryRow label="Réservations"   value={String(reservations.length)} />
            <SummaryRow label="Publié le"      value={formatDate(voyage.created_at)} />
          </div>

          {/* ID */}
          <div className="rounded-2xl border border-border bg-surface p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">ID</p>
            <p className="font-mono text-xs text-ink break-all">{voyage.id}</p>
          </div>
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

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${highlight ? "text-success" : ""}`}>{value}</span>
    </div>
  );
}
