import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Calendar, Users, Phone, Star,
  XCircle, Navigation, Copy, Check, Banknote,
} from "lucide-react";
import { Button, Spinner } from "@gotaxi/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { useAdminReservationDetail, useCancelReservation } from "@/hooks/useAdmin";
import { formatDate, formatDateTime, formatCurrency, formatPhoneNumber, getInitials, getMediaUrl } from "@/lib/format";
import { toast } from "sonner";
import type { ReservationStatut, VoyageStatut } from "@/types/domain";

const STATUT_CONFIG: Record<ReservationStatut, { label: string; variant: "success" | "info" | "warning" | "error" | "neutral" }> = {
  EN_ATTENTE: { label: "En attente", variant: "warning" },
  CONFIRMEE:  { label: "Confirmée",  variant: "success" },
  REFUSEE:    { label: "Refusée",    variant: "error"   },
  ANNULEE:    { label: "Annulée",    variant: "neutral" },
  TERMINEE:   { label: "Terminée",   variant: "info"    },
};

const VOYAGE_STATUT_CONFIG: Record<VoyageStatut, { label: string; variant: "success" | "info" | "warning" | "error" | "neutral" }> = {
  PUBLIE:   { label: "Publié",   variant: "info"    },
  COMPLET:  { label: "Complet",  variant: "warning" },
  EN_COURS: { label: "En cours", variant: "success" },
  TERMINE:  { label: "Terminé",  variant: "neutral" },
  ANNULE:   { label: "Annulé",   variant: "error"   },
};

const CANCELLABLE: ReservationStatut[] = ["EN_ATTENTE", "CONFIRMEE"];

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-1.5 text-muted-foreground hover:text-primary transition-colors"
      title="Copier"
    >
      {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
    </button>
  );
}

export default function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const { data: detail, isLoading } = useAdminReservationDetail(id!);
  const cancelMutation = useCancelReservation();

  if (isLoading) return <Spinner fullScreen />;
  if (!detail) return <p className="p-8 text-center text-muted-foreground">Réservation introuvable</p>;

  const { reservation, client_full, voyage_full } = detail;
  const statut = STATUT_CONFIG[reservation.statut] ?? { label: reservation.statut, variant: "neutral" as const };
  const canCancel = CANCELLABLE.includes(reservation.statut);

  const prixParPlace = voyage_full
    ? voyage_full.prix_par_place
    : reservation.nombre_places > 0
      ? reservation.prix_total / reservation.nombre_places
      : null;

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    try {
      await cancelMutation.mutateAsync({ reservationId: id!, reason: cancelReason });
      toast.success("Réservation annulée");
      setShowCancel(false);
      setCancelReason("");
    } catch {
      toast.error("Erreur lors de l'annulation");
    }
  };

  return (
    <>
      <PageHeader
        title={reservation.code_confirmation}
        subtitle="Détail de la réservation"
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge label={statut.label} variant={statut.variant} dot />
            <Button variant="ghost" leftIcon={<ArrowLeft className="size-4" />} onClick={() => navigate(-1)}>
              Retour
            </Button>
          </div>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">

        {/* ── Colonne principale ────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Client */}
          {client_full ? (
            <div
              className="flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-white p-4 transition-colors hover:bg-surface"
              onClick={() => navigate(`/users/${client_full.id}`)}
            >
              {client_full.photo_url ? (
                <img src={getMediaUrl(client_full.photo_url) ?? ""} alt="" className="size-12 rounded-xl object-cover ring-2 ring-border" />
              ) : (
                <div className="flex size-12 items-center justify-center rounded-xl bg-surface text-base font-bold ring-2 ring-border">
                  {getInitials(client_full.nom, client_full.prenom)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold">{client_full.prenom} {client_full.nom}</p>
                  <UserStatusBadge statut={client_full.statut} />
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="size-3" />{formatPhoneNumber(client_full.telephone)}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="size-3" />{client_full.note_moyenne.toFixed(1)} ({client_full.nombre_avis} avis)
                  </p>
                </div>
              </div>
              <Users className="size-4 shrink-0 text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm text-muted-foreground">Client non trouvé</p>
            </div>
          )}

          {/* Voyage */}
          {voyage_full ? (
            <div
              className="cursor-pointer rounded-2xl border border-border bg-white p-5 transition-colors hover:bg-surface"
              onClick={() => navigate(`/voyages/${voyage_full.id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-base font-extrabold">
                    {voyage_full.ville_depart} → {voyage_full.ville_arrivee}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" />{formatDateTime(voyage_full.date_depart)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {(() => {
                    const vs = VOYAGE_STATUT_CONFIG[voyage_full.statut];
                    return vs ? <StatusBadge label={vs.label} variant={vs.variant} dot /> : null;
                  })()}
                  <Navigation className="size-4 text-muted-foreground" />
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                <Detail icon={<MapPin className="size-4" />}    label="Point départ"  value={voyage_full.point_depart} />
                <Detail icon={<MapPin className="size-4" />}    label="Point arrivée" value={voyage_full.point_arrivee} />
                <Detail icon={<Users className="size-4" />}     label="Places dispo"
                  value={`${voyage_full.nombre_places_restantes} / ${voyage_full.nombre_places_total}`} />
                <Detail icon={<Banknote className="size-4" />}  label="Prix / place"  value={formatCurrency(voyage_full.prix_par_place)} />
                {voyage_full.distance_km != null && (
                  <Detail icon={<MapPin className="size-4" />}  label="Distance"      value={`${voyage_full.distance_km} km`} />
                )}
              </dl>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm text-muted-foreground">Voyage non trouvé</p>
            </div>
          )}

          {/* Détails réservation */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="mb-4 text-sm font-bold">Détails de la réservation</h3>
            <dl className="grid grid-cols-2 gap-3">
              <Detail icon={<Users className="size-4" />}    label="Places réservées" value={`${reservation.nombre_places} place${reservation.nombre_places > 1 ? "s" : ""}`} />
              {prixParPlace != null && (
                <Detail icon={<Banknote className="size-4" />} label="Prix / place" value={formatCurrency(prixParPlace)} />
              )}
              <Detail icon={<Banknote className="size-4" />} label="Prix total"        value={formatCurrency(reservation.prix_total)} />
              <Detail icon={<Calendar className="size-4" />} label="Créée le"          value={formatDateTime(reservation.created_at)} />
            </dl>
          </div>
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div className="space-y-3">

          {/* Actions */}
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-sm font-bold mb-3">Actions admin</p>

            {canCancel ? (
              !showCancel ? (
                <button
                  onClick={() => setShowCancel(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-error/30 py-2.5 text-sm font-semibold text-error transition-colors hover:bg-error/5"
                >
                  <XCircle className="size-4" />
                  Annuler la réservation
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">Motif d'annulation (requis)</p>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Ex : doublon, erreur client…"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
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
                    Confirmer
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
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune action disponible pour une réservation {statut.label.toLowerCase()}.
              </p>
            )}
          </div>

          {/* Récapitulatif */}
          <div className="rounded-2xl border border-border bg-white p-4 space-y-2.5">
            <p className="text-sm font-bold">Récapitulatif</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Code</span>
              <span className="flex items-center font-mono text-xs font-bold text-primary">
                {reservation.code_confirmation}
                <CopyButton value={reservation.code_confirmation} />
              </span>
            </div>
            <SummaryRow label="Places"     value={`${reservation.nombre_places} place${reservation.nombre_places > 1 ? "s" : ""}`} />
            {prixParPlace != null && (
              <SummaryRow label="Prix / place" value={formatCurrency(prixParPlace)} />
            )}
            <SummaryRow label="Prix total" value={formatCurrency(reservation.prix_total)} highlight />
            <SummaryRow label="Statut"     value={statut.label} />
            <SummaryRow label="Créée le"   value={formatDate(reservation.created_at)} />
          </div>

          {/* Liens rapides */}
          {voyage_full && (
            <Button
              variant="outline"
              className="w-full"
              leftIcon={<Navigation className="size-4" />}
              onClick={() => navigate(`/voyages/${voyage_full.id}`)}
            >
              Voir le voyage
            </Button>
          )}
          {client_full && (
            <Button
              variant="outline"
              className="w-full"
              leftIcon={<Users className="size-4" />}
              onClick={() => navigate(`/users/${client_full.id}`)}
            >
              Voir le client
            </Button>
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

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${highlight ? "text-success" : ""}`}>{value}</span>
    </div>
  );
}
