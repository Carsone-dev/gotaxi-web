import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Package, MapPin, Phone, Truck, CheckCircle, XCircle,
  User, Calendar, Weight, Banknote, AlertCircle, ExternalLink,
} from "lucide-react";
import { Button, Spinner, Badge } from "@gotaxi/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAdminColisDetail, useValidateColis, useRejectColis } from "@/hooks/useAdmin";
import { formatDate, formatDateTime, formatCurrency, formatPhoneNumber, getMediaUrl } from "@/lib/format";
import { toast } from "sonner";
import type { ColisStatut } from "@/types/domain";

const STATUT_CONFIG: Record<ColisStatut, { label: string; variant: "success" | "info" | "warning" | "error" | "neutral" }> = {
  EN_ATTENTE_PAIEMENT: { label: "Paiement en attente", variant: "warning"  },
  EN_ATTENTE: { label: "En attente", variant: "warning"  },
  CONFIRME:   { label: "Confirmé",   variant: "info"     },
  EN_TRANSIT: { label: "En transit", variant: "info"     },
  LIVRE:      { label: "Livré",      variant: "success"  },
  ANNULE:     { label: "Annulé",     variant: "neutral"  },
};

const TIMELINE: Array<{ statut: ColisStatut; label: string }> = [
  { statut: "EN_ATTENTE", label: "En attente" },
  { statut: "CONFIRME",   label: "Confirmé"   },
  { statut: "EN_TRANSIT", label: "En transit" },
  { statut: "LIVRE",      label: "Livré"      },
];

const STATUT_ORDER: Record<ColisStatut, number> = {
  EN_ATTENTE_PAIEMENT: -1, EN_ATTENTE: 0, CONFIRME: 1, EN_TRANSIT: 2, LIVRE: 3, ANNULE: -1,
};

const CATEGORIE_LABELS: Record<string, string> = {
  DOCUMENTS:    "Documents",
  VETEMENTS:    "Vêtements",
  ELECTRONIQUE: "Électronique",
  ALIMENTAIRE:  "Alimentaire",
  FRAGILE:      "Fragile",
  AUTRE:        "Autre",
};

export default function ColisDetailPage() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason]     = useState("");

  const { data: detail, isLoading } = useAdminColisDetail(id!);
  const validate = useValidateColis();
  const reject   = useRejectColis();

  if (isLoading) return <Spinner fullScreen />;
  if (!detail)   return <p className="p-8 text-center text-muted-foreground">Colis introuvable</p>;

  const { colis, expediteur } = detail;
  const conf        = STATUT_CONFIG[colis.statut] ?? { label: colis.statut, variant: "neutral" as const };
  const currentStep = STATUT_ORDER[colis.statut];
  const isPending   = colis.statut === "EN_ATTENTE";

  const handleValidate = async () => {
    try {
      await validate.mutateAsync(colis.id);
      toast.success("Colis validé — le chauffeur peut l'embarquer");
    } catch {
      toast.error("Erreur lors de la validation");
    }
  };

  const handleReject = async () => {
    try {
      await reject.mutateAsync({ colisId: colis.id, reason: rejectReason });
      toast.success("Colis refusé");
      setShowRejectForm(false);
      setRejectReason("");
    } catch {
      toast.error("Erreur lors du refus");
    }
  };

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
        {/* ── Colonne principale ────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Timeline */}
          {colis.statut !== "ANNULE" && (
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="mb-5 text-sm font-bold">Progression</h3>
              <div className="flex items-start">
                {TIMELINE.map((step, i) => {
                  const done   = currentStep >= i;
                  const active = currentStep === i;
                  return (
                    <div key={step.statut} className="flex flex-1 flex-col items-center gap-1.5">
                      <div className="flex w-full items-center">
                        {i > 0 && (
                          <div className={`h-0.5 flex-1 rounded-full ${currentStep >= i ? "bg-primary" : "bg-border"}`} />
                        )}
                        <div
                          className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            done ? "bg-primary text-white" : "bg-surface text-muted-foreground"
                          }`}
                        >
                          {done ? <CheckCircle className="size-4" /> : <span>{i + 1}</span>}
                        </div>
                        {i < TIMELINE.length - 1 && (
                          <div className={`h-0.5 flex-1 rounded-full ${currentStep > i ? "bg-primary" : "bg-border"}`} />
                        )}
                      </div>
                      <p className={`text-[11px] text-center font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {colis.statut === "ANNULE" && (
            <div className="flex items-center gap-3 rounded-2xl border border-error/20 bg-error/5 p-4">
              <XCircle className="size-5 shrink-0 text-error" />
              <p className="text-sm font-medium text-error">Ce colis a été annulé</p>
            </div>
          )}

          {/* Infos principales */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="mb-4 text-sm font-bold">Informations</h3>

            {/* Photo colis */}
            {colis.photo_url && (
              <div className="mb-5">
                <img
                  src={getMediaUrl(colis.photo_url) ?? ""}
                  alt="Photo du colis"
                  className="h-48 w-full rounded-xl object-cover"
                />
              </div>
            )}

            <dl className="space-y-3">
              <InfoRow icon={<Package className="size-4" />}  label="Description"  value={colis.description} />
              <InfoRow icon={<Package className="size-4" />}  label="Catégorie"    value={CATEGORIE_LABELS[colis.categorie] ?? colis.categorie} />
              {colis.poids_kg != null && (
                <InfoRow icon={<Weight className="size-4" />} label="Poids"        value={`${colis.poids_kg} kg`} />
              )}
              <InfoRow icon={<MapPin className="size-4" />}   label="Trajet"       value={`${colis.ville_depart} → ${colis.ville_arrivee}`} />
              <InfoRow icon={<User className="size-4" />}     label="Destinataire" value={colis.destinataire_nom} />
              <InfoRow icon={<Phone className="size-4" />}    label="Téléphone"    value={formatPhoneNumber(colis.destinataire_telephone)} />
              <InfoRow icon={<Truck className="size-4" />}    label="Transport"    value="À régler directement avec le chauffeur" />
              <InfoRow icon={<Calendar className="size-4" />} label="Créé le"      value={formatDateTime(colis.created_at)} />
            </dl>

            {colis.fragile && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-warning/30 bg-warning-bg px-3 py-2">
                <AlertCircle className="size-4 text-warning-text" />
                <span className="text-xs font-semibold text-warning-text">Colis fragile — manipuler avec précaution</span>
              </div>
            )}
          </div>

          {/* Voyage lié */}
          {colis.voyage && (
            <div
              className="flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-white p-4 transition-colors hover:bg-surface"
              onClick={() => navigate(`/voyages/${colis.voyage_id}`)}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface">
                <Truck className="size-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{colis.voyage.ville_depart} → {colis.voyage.ville_arrivee}</p>
                <p className="text-xs text-muted-foreground">
                  Départ le {formatDate(colis.voyage.date_depart)} · {formatCurrency(colis.voyage.prix_par_place)}/place
                </p>
              </div>
              <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <div className="space-y-3">

          {/* Actions KYC-like — seulement si en attente */}
          {isPending && (
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm font-bold">Validation</p>
              {!showRejectForm ? (
                <div className="mt-3 space-y-2">
                  <Button
                    className="w-full"
                    leftIcon={<CheckCircle className="size-4" />}
                    onClick={handleValidate}
                    loading={validate.isPending}
                  >
                    Valider le colis
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    leftIcon={<XCircle className="size-4" />}
                    onClick={() => setShowRejectForm(true)}
                  >
                    Refuser
                  </Button>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-muted-foreground">Motif du refus</p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Ex : Description incorrecte, colis non conforme…"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-border bg-surface p-2.5 text-sm outline-none focus:border-primary"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={handleReject}
                    loading={reject.isPending}
                    disabled={!rejectReason.trim()}
                  >
                    Confirmer le refus
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => { setShowRejectForm(false); setRejectReason(""); }}
                  >
                    Annuler
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Frais plateforme */}
          <div className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Banknote className="size-4" />
              <p className="text-xs font-bold uppercase tracking-wider">Frais plateforme</p>
            </div>
            <p className="text-2xl font-extrabold text-primary">
              {formatCurrency(colis.frais_plateforme)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {colis.statut === "EN_ATTENTE_PAIEMENT" ? "Paiement FedaPay en attente" : "Payé via FedaPay"}
            </p>
            {colis.prix != null && (
              <p className="mt-2 text-xs text-muted-foreground">
                Transport : {formatCurrency(colis.prix)} à régler avec le chauffeur
              </p>
            )}
          </div>

          {/* Expéditeur */}
          {expediteur && (
            <div
              className="cursor-pointer rounded-2xl border border-border bg-white p-4 transition-colors hover:bg-surface"
              onClick={() => navigate(`/users/${expediteur.id}`)}
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Expéditeur</p>
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface text-sm font-bold text-muted-foreground">
                  {expediteur.prenom[0]}{expediteur.nom[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{expediteur.prenom} {expediteur.nom}</p>
                  <p className="text-xs text-muted-foreground">{formatPhoneNumber(expediteur.telephone)}</p>
                </div>
                <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
              </div>
            </div>
          )}

          {/* Référence */}
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Référence</p>
            <p className="mt-1 font-mono text-base font-bold text-primary">{colis.code_suivi}</p>
          </div>

          {/* Badges infos */}
          <div className="rounded-2xl border border-border bg-white p-4 space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Détails</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{CATEGORIE_LABELS[colis.categorie] ?? colis.categorie}</Badge>
              {colis.fragile && <Badge variant="warning">Fragile</Badge>}
              {colis.poids_kg != null && <Badge variant="secondary">{colis.poids_kg} kg</Badge>}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mis à jour</p>
            <p className="mt-1 text-sm">{formatDateTime(colis.updated_at)}</p>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <dt className="w-28 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}
