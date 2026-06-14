import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Car, CheckCircle, XCircle, Star, Phone, Calendar,
  Wifi, WifiOff, MapPin, TrendingUp, Globe, Globe2, Banknote,
  Users, Trash2, AlertTriangle, Award,
} from "lucide-react";
import { Button, Spinner, Badge } from "@gotaxi/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { KycDocumentViewer } from "@/components/chauffeurs/KycDocumentViewer";
import {
  useAdminChauffeurDetail,
  useValidateKyc,
  useRejectKyc,
  useSuspendUser,
  useActivateUser,
  useUpdateChauffeur,
  useToggleVehicule,
  useDeleteVehicule,
  useAdminChauffeurVoyages,
  useAdminChauffeurRevenus,
  useAdminPayoutAccount,
  useAdminUpsertPayoutAccount,
  useAdminDeletePayoutAccount,
} from "@/hooks/useAdmin";
import type { PayoutOperateur } from "@/types/domain";
import { formatDate, formatDateTime, formatCurrency, formatPhoneNumber, getInitials, getMediaUrl } from "@/lib/format";
import { toast } from "sonner";
import type { VoyageStatut } from "@/types/domain";

type Tab = "profil" | "voyages" | "revenus";

const OPERATEUR_LABEL: Record<PayoutOperateur, { label: string; emoji: string; color: string }> = {
  FEDAPAY:      { label: "FedaPay",      emoji: "💜", color: "text-purple-600" },
  MTN_MOMO:     { label: "MTN MoMo",     emoji: "💛", color: "text-yellow-600" },
  MOOV_MONEY:   { label: "Moov Money",   emoji: "🔵", color: "text-blue-600"   },
  ORANGE_MONEY: { label: "Orange Money", emoji: "🟠", color: "text-orange-600" },
  CELTIS:       { label: "Celtiis",      emoji: "🔷", color: "text-sky-600"    },
  WALLET:       { label: "Wallet GoTaxi",emoji: "👛", color: "text-green-600"  },
};
const OP_LIST: PayoutOperateur[] = ["FEDAPAY", "MTN_MOMO", "MOOV_MONEY", "ORANGE_MONEY", "CELTIS"];

const VOYAGE_STATUT: Record<VoyageStatut, { label: string; variant: "success" | "info" | "warning" | "error" | "neutral" }> = {
  PUBLIE:   { label: "Publié",   variant: "info"    },
  COMPLET:  { label: "Complet",  variant: "warning" },
  EN_COURS: { label: "En cours", variant: "info"    },
  TERMINE:  { label: "Terminé",  variant: "success" },
  ANNULE:   { label: "Annulé",   variant: "neutral" },
};

const TAB_LABELS: Record<Tab, string> = {
  profil:   "Profil & KYC",
  voyages:  "Voyages",
  revenus:  "Revenus",
};

export default function ChauffeurDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("profil");

  // KYC
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason]     = useState("");

  // Compte
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [suspendReason, setSuspendReason]     = useState("");

  // Véhicule à supprimer
  const [vehiculeToDelete, setVehiculeToDelete] = useState<string | null>(null);

  const { data: detail, isLoading } = useAdminChauffeurDetail(id!);

  const validateKyc      = useValidateKyc();
  const rejectKyc        = useRejectKyc();
  const suspend          = useSuspendUser();
  const activate         = useActivateUser();
  const updateChauffeur  = useUpdateChauffeur();
  const toggleVehicule   = useToggleVehicule();
  const deleteVehicule   = useDeleteVehicule();

  const { data: voyagesData, isLoading: voyagesLoading } = useAdminChauffeurVoyages(id!, tab === "voyages");
  const { data: revenus,     isLoading: revenusLoading  } = useAdminChauffeurRevenus(id!, tab === "revenus");

  if (isLoading) return <Spinner fullScreen />;
  if (!detail) return <p className="p-8 text-center text-muted-foreground">Chauffeur introuvable</p>;

  const { user, chauffeur } = detail;
  const voyages = voyagesData?.items ?? [];

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleValidateKyc = async () => {
    try {
      await validateKyc.mutateAsync(chauffeur.id);
      toast.success("KYC validé — le chauffeur peut se mettre en ligne");
    } catch {
      toast.error("Erreur lors de la validation KYC");
    }
  };

  const handleRejectKyc = async () => {
    try {
      await rejectKyc.mutateAsync({ chauffeurId: chauffeur.id, reason: rejectReason });
      toast.success("KYC rejeté");
      setShowRejectForm(false);
      setRejectReason("");
    } catch {
      toast.error("Erreur lors du rejet KYC");
    }
  };

  const handleSuspend = async () => {
    try {
      await suspend.mutateAsync({ userId: user.id, reason: suspendReason });
      toast.success("Compte suspendu");
      setShowSuspendForm(false);
      setSuspendReason("");
    } catch {
      toast.error("Erreur lors de la suspension");
    }
  };

  const handleActivate = async () => {
    try {
      await activate.mutateAsync(user.id);
      toast.success("Compte réactivé");
    } catch {
      toast.error("Erreur lors de la réactivation");
    }
  };

  const handleToggleTransfrontalier = async () => {
    try {
      await updateChauffeur.mutateAsync({
        userId: id!,
        data: { autorisation_transfrontaliere: !chauffeur.autorisation_transfrontaliere },
      });
      toast.success(
        chauffeur.autorisation_transfrontaliere
          ? "Autorisation transfrontalière révoquée"
          : "Autorisation transfrontalière accordée",
      );
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleToggleVehicule = async (vehiculeId: string, actif: boolean) => {
    try {
      await toggleVehicule.mutateAsync({ vehiculeId, actif });
      toast.success(actif ? "Véhicule activé" : "Véhicule désactivé");
    } catch {
      toast.error("Erreur lors de la mise à jour du véhicule");
    }
  };

  const handleDeleteVehicule = async (vehiculeId: string) => {
    try {
      await deleteVehicule.mutateAsync(vehiculeId);
      toast.success("Véhicule supprimé");
      setVehiculeToDelete(null);
    } catch {
      toast.error("Erreur lors de la suppression du véhicule");
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
        {/* ── Colonne principale ─────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* En-tête profil — toujours visible */}
          <div className="flex items-center gap-5 rounded-2xl border border-border bg-white p-5">
            {user.photo_url ? (
              <img src={getMediaUrl(user.photo_url) ?? ""} alt="" className="size-20 rounded-2xl object-cover ring-2 ring-border" />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-2xl bg-surface text-2xl font-extrabold ring-2 ring-border">
                {getInitials(user.nom, user.prenom)}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-extrabold">{user.prenom} {user.nom}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <UserStatusBadge statut={user.statut} />
                {chauffeur.kyc_valide
                  ? <Badge variant="success">KYC validé</Badge>
                  : <Badge variant="warning">KYC en attente</Badge>
                }
                {chauffeur.en_ligne
                  ? <span className="flex items-center gap-1 text-xs font-medium text-success"><Wifi className="size-3" /> En ligne</span>
                  : <span className="flex items-center gap-1 text-xs text-muted-foreground"><WifiOff className="size-3" /> Hors ligne</span>
                }
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Phone className="size-3.5" />{formatPhoneNumber(user.telephone)}</span>
                <span className="flex items-center gap-1.5"><Calendar className="size-3.5" />{formatDate(user.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Stats résumé — toujours visible */}
          <div className="grid grid-cols-3 gap-3">
            <StatBox icon={<MapPin className="size-4 text-primary" />}   label="Trajets"       value={chauffeur.nombre_trajets} />
            <StatBox icon={<Banknote className="size-4 text-success" />} label="Revenus total" value={formatCurrency(chauffeur.revenus_total)} />
            <StatBox
              icon={<Award className="size-4 text-accent-yellow" />}
              label="Note moyenne"
              value={
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-accent-yellow text-accent-yellow" />
                  {user.note_moyenne.toFixed(1)}
                  <span className="text-xs font-normal text-muted-foreground">/ 5</span>
                </span>
              }
            />
          </div>

          {/* Onglets */}
          <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
            {(["profil", "voyages", "revenus"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                  tab === t ? "bg-white text-ink shadow-sm" : "text-muted-foreground hover:text-ink"
                }`}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>

          {/* ── Onglet Profil & KYC ──────────────────────────────────────── */}
          {tab === "profil" && (
            <div className="space-y-4">
              {/* Documents */}
              <div className="rounded-2xl border border-border bg-white p-5">
                <h3 className="mb-4 text-sm font-bold">Documents KYC</h3>
                <KycDocumentViewer
                  cin_url={chauffeur.cin_url}
                  permis_url={chauffeur.permis_url}
                  casier_url={chauffeur.casier_judiciaire_url}
                />
                <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
                  <KycRow label="N° CIN"     value={chauffeur.cin_numero ?? "Non fourni"} />
                  <KycRow label="N° Permis"  value={chauffeur.permis_numero ?? "Non fourni"} />
                  <KycRow
                    label="Expiration permis"
                    value={chauffeur.permis_expiration ? formatDate(chauffeur.permis_expiration) : "—"}
                  />
                  <KycRow
                    label="Avis reçus"
                    value={`${user.nombre_avis} avis`}
                  />
                </dl>
              </div>

              {/* Véhicules */}
              {chauffeur.vehicules.length > 0 && (
                <div className="rounded-2xl border border-border bg-white p-5">
                  <h3 className="mb-4 text-sm font-bold">
                    Véhicules{" "}
                    <span className="font-normal text-muted-foreground">({chauffeur.vehicules.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {chauffeur.vehicules.map((v) => (
                      <div key={v.id}>
                        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface">
                            <Car className="size-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">
                              {v.marque} {v.modele}{" "}
                              <span className="font-normal text-muted-foreground">({v.annee})</span>
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {v.immatriculation} · {v.couleur} · {v.nombre_places} places
                              {v.climatise && " · Climatisé"} · {v.type_vehicule}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {v.actif
                              ? <Badge variant="success">Actif</Badge>
                              : <Badge variant="secondary">Inactif</Badge>
                            }
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleVehicule(v.id, !v.actif)}
                              loading={toggleVehicule.isPending && toggleVehicule.variables?.vehiculeId === v.id}
                            >
                              {v.actif ? "Désactiver" : "Activer"}
                            </Button>
                            <button
                              type="button"
                              onClick={() => setVehiculeToDelete(v.id)}
                              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-error/10 hover:text-error"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Confirmation suppression véhicule */}
                        {vehiculeToDelete === v.id && (
                          <div className="mt-2 flex items-center gap-2 rounded-xl border border-error/20 bg-error/5 p-3">
                            <AlertTriangle className="size-4 shrink-0 text-error" />
                            <p className="flex-1 text-xs text-error">Supprimer ce véhicule définitivement ?</p>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteVehicule(v.id)}
                              loading={deleteVehicule.isPending}
                            >
                              Confirmer
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setVehiculeToDelete(null)}
                            >
                              Annuler
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Onglet Voyages ───────────────────────────────────────────── */}
          {tab === "voyages" && (
            <div className="rounded-2xl border border-border bg-white overflow-hidden">
              <div className="border-b border-border px-5 py-4">
                <h3 className="text-sm font-bold">Voyages effectués</h3>
              </div>
              {voyagesLoading ? (
                <div className="flex justify-center p-8"><Spinner /></div>
              ) : !voyages.length ? (
                <p className="p-8 text-center text-sm text-muted-foreground">Aucun voyage</p>
              ) : (
                <div className="divide-y divide-border">
                  {voyages.map((v) => {
                    const conf = VOYAGE_STATUT[v.statut] ?? { label: v.statut, variant: "neutral" as const };
                    const vendues = v.nombre_places_total - v.nombre_places_restantes;
                    const pct = v.nombre_places_total > 0
                      ? Math.round((vendues / v.nombre_places_total) * 100)
                      : 0;
                    const barColor = pct >= 100 ? "bg-error" : pct >= 75 ? "bg-success" : pct >= 40 ? "bg-warning-text" : "bg-primary/40";
                    return (
                      <div
                        key={v.id}
                        className="flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface"
                        onClick={() => navigate(`/voyages/${v.id}`)}
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface">
                          <MapPin className="size-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {v.ville_depart} → {v.ville_arrivee}
                          </p>
                          <p className="text-xs text-muted-foreground mb-1.5">
                            {formatDateTime(v.date_depart)}
                          </p>
                          {/* Barre de remplissage */}
                          <div className="flex items-center gap-2">
                            <div className="h-1 w-20 overflow-hidden rounded-full bg-surface">
                              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              <Users className="inline size-3 mr-0.5" />{vendues}/{v.nombre_places_total}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold">{formatCurrency(v.prix_par_place)}<span className="text-xs font-normal text-muted-foreground">/place</span></p>
                          <StatusBadge label={conf.label} variant={conf.variant} dot />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Onglet Revenus ───────────────────────────────────────────── */}
          {tab === "revenus" && (
            <div className="space-y-4">
              {revenusLoading ? (
                <div className="flex justify-center p-8"><Spinner /></div>
              ) : !revenus ? (
                <div className="rounded-2xl border border-border bg-white p-8 text-center">
                  <TrendingUp className="mx-auto mb-3 size-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Données de revenus non disponibles</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Endpoint <code className="rounded bg-surface px-1 py-0.5">GET /admin/chauffeurs/:id/revenus</code> en attente d'implémentation backend
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <RevenueCard label="Aujourd'hui"   value={formatCurrency(revenus.aujourd_hui)} accent="blue" />
                    <RevenueCard label="Cette semaine" value={formatCurrency(revenus.semaine)}     accent="green" />
                    <RevenueCard label="Ce mois"       value={formatCurrency(revenus.mois)}        accent="purple" />
                    <RevenueCard label="Total cumulé"  value={formatCurrency(revenus.total)}       accent="gold" />
                  </div>
                  <div className="rounded-2xl border border-border bg-white p-5">
                    <h3 className="mb-4 text-sm font-bold">Activité globale</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <KycRow label="Nombre de trajets" value={String(chauffeur.nombre_trajets)} />
                      <KycRow label="Revenus total"     value={formatCurrency(chauffeur.revenus_total)} />
                      <KycRow label="Note moyenne"      value={`${user.note_moyenne.toFixed(1)} / 5`} />
                      <KycRow label="Avis reçus"        value={String(user.nombre_avis)} />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <div className="space-y-3">

          {/* KYC */}
          {!chauffeur.kyc_valide ? (
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm font-bold">Validation KYC</p>
              <div className="mt-3 space-y-2">
                {!showRejectForm ? (
                  <>
                    <Button
                      className="w-full"
                      leftIcon={<CheckCircle className="size-4" />}
                      onClick={handleValidateKyc}
                      loading={validateKyc.isPending}
                    >
                      Valider le KYC
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      leftIcon={<XCircle className="size-4" />}
                      onClick={() => setShowRejectForm(true)}
                    >
                      Rejeter
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">Motif du rejet (obligatoire)</p>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Ex : Photo illisible, document expiré…"
                      rows={3}
                      className="w-full resize-none rounded-xl border border-border bg-surface p-2.5 text-sm outline-none focus:border-primary"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={handleRejectKyc}
                      loading={rejectKyc.isPending}
                      disabled={!rejectReason.trim()}
                    >
                      Confirmer le rejet
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => { setShowRejectForm(false); setRejectReason(""); }}
                    >
                      Annuler
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-success/30 bg-success/5 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4 text-success" />
                <p className="text-sm font-bold text-success">KYC validé</p>
              </div>
              {chauffeur.kyc_valide_le && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Validé le {formatDate(chauffeur.kyc_valide_le)}
                </p>
              )}
            </div>
          )}

          {/* Autorisation transfrontalière */}
          <div className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              {chauffeur.autorisation_transfrontaliere
                ? <Globe className="size-4 text-success" />
                : <Globe2 className="size-4 text-muted-foreground" />
              }
              <p className="text-sm font-bold">Transfrontalier</p>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              {chauffeur.autorisation_transfrontaliere
                ? "Ce chauffeur est autorisé à effectuer des trajets internationaux (Bénin ↔ Togo)."
                : "Ce chauffeur n'est pas autorisé pour les trajets internationaux."}
            </p>
            <Button
              variant={chauffeur.autorisation_transfrontaliere ? "destructive" : "primary"}
              size="sm"
              className="w-full"
              onClick={handleToggleTransfrontalier}
              loading={updateChauffeur.isPending}
            >
              {chauffeur.autorisation_transfrontaliere ? "Révoquer l'autorisation" : "Accorder l'autorisation"}
            </Button>
          </div>

          {/* Compte — Suspendre */}
          {user.statut === "ACTIF" && (
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm font-bold">Compte</p>
              {showSuspendForm ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    placeholder="Motif de suspension…"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-border bg-surface p-2.5 text-sm outline-none focus:border-primary"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={handleSuspend}
                    loading={suspend.isPending}
                    disabled={!suspendReason.trim()}
                  >
                    Confirmer la suspension
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => { setShowSuspendForm(false); setSuspendReason(""); }}
                  >
                    Annuler
                  </Button>
                </div>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => setShowSuspendForm(true)}
                >
                  Suspendre le compte
                </Button>
              )}
            </div>
          )}

          {/* Compte — Réactiver */}
          {user.statut === "SUSPENDU" && (
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm font-bold">Compte</p>
              <Button
                size="sm"
                className="mt-3 w-full"
                onClick={handleActivate}
                loading={activate.isPending}
              >
                Réactiver le compte
              </Button>
            </div>
          )}

          {/* Compte Payout */}
          <PayoutSection chauffeurId={chauffeur.id} />

          {/* Récapitulatif */}
          <div className="rounded-2xl border border-border bg-white p-4 space-y-2.5">
            <p className="text-sm font-bold">Récapitulatif</p>
            <SummaryRow label="Note"          value={`${user.note_moyenne.toFixed(1)} / 5`} />
            <SummaryRow label="Avis reçus"    value={String(user.nombre_avis)} />
            <SummaryRow label="Trajets"        value={String(chauffeur.nombre_trajets)} />
            <SummaryRow label="Revenus total"  value={formatCurrency(chauffeur.revenus_total)} />
          </div>
        </div>
      </div>
    </>
  );
}

// ── Composants locaux ──────────────────────────────────────────────────────

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface">
        {icon}
      </div>
      <div>
        <p className="text-base font-extrabold leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

const REVENUE_ACCENT: Record<string, string> = {
  blue:   "border-blue-200   bg-blue-50   text-blue-700",
  green:  "border-green-200  bg-green-50  text-green-700",
  purple: "border-purple-200 bg-purple-50 text-purple-700",
  gold:   "border-yellow-200 bg-yellow-50 text-yellow-700",
};

function RevenueCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${REVENUE_ACCENT[accent] ?? ""}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="mt-1 text-xl font-extrabold">{value}</p>
    </div>
  );
}

function KycRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// ── Section Payout ────────────────────────────────────────────────────────────

function PayoutSection({ chauffeurId }: { chauffeurId: string }) {
  const { data: compte, isLoading, error } = useAdminPayoutAccount(chauffeurId);
  const upsert = useAdminUpsertPayoutAccount(chauffeurId);
  const remove = useAdminDeletePayoutAccount(chauffeurId);

  const [editing, setEditing] = useState(false);
  const [op, setOp] = useState<PayoutOperateur>("MTN_MOMO");
  const [phone, setPhone] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (compte) { setOp(compte.operateur as PayoutOperateur); setPhone(compte.telephone); }
  }, [compte]);

  const hasAccount = !!compte && !error;
  const showForm = !hasAccount || editing;

  const handleSave = async () => {
    if (phone.trim().length < 8) return;
    await upsert.mutateAsync({ operateur: op, telephone: phone.trim() });
    setEditing(false);
  };

  const handleDelete = async () => {
    await remove.mutateAsync();
    setConfirmDelete(false);
    setEditing(false);
    setPhone("");
    setOp("MTN_MOMO");
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <p className="mb-3 text-sm font-bold">Compte de paiement</p>

      {isLoading && <p className="text-xs text-muted-foreground">Chargement…</p>}

      {/* Compte existant (lecture) */}
      {!isLoading && hasAccount && !editing && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-3">
            <span className="text-xl">{OPERATEUR_LABEL[compte.operateur as PayoutOperateur]?.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${OPERATEUR_LABEL[compte.operateur as PayoutOperateur]?.color}`}>
                {OPERATEUR_LABEL[compte.operateur as PayoutOperateur]?.label}
              </p>
              <p className="text-xs text-muted-foreground font-mono">{compte.telephone}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${compte.actif ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
              {compte.actif ? "Actif" : "Inactif"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => setEditing(true)}>Modifier</Button>
            <Button variant="ghost" size="sm" className="flex-1 text-error hover:text-error" onClick={() => setConfirmDelete(true)}>Supprimer</Button>
          </div>
          {confirmDelete && (
            <div className="rounded-xl border border-error/20 bg-error/5 p-3 space-y-2">
              <p className="text-xs text-error">Supprimer ce compte payout ?</p>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" className="flex-1" onClick={handleDelete} loading={remove.isPending}>Confirmer</Button>
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => setConfirmDelete(false)}>Annuler</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Aucun compte ou formulaire */}
      {!isLoading && showForm && (
        <div className="space-y-3">
          {!hasAccount && <p className="text-xs text-muted-foreground">Aucun compte configuré. Les paiements vont sur le wallet GoTaxi.</p>}

          {/* Opérateur */}
          <div className="grid grid-cols-2 gap-1.5">
            {OP_LIST.map((o) => {
              const cfg = OPERATEUR_LABEL[o];
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOp(o)}
                  className={`flex items-center gap-1.5 rounded-lg border p-2 text-left text-xs transition-colors ${
                    op === o ? "border-primary bg-primary/5 font-semibold" : "border-border bg-surface text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <span>{cfg.emoji}</span>
                  <span className="truncate">{cfg.label}</span>
                </button>
              );
            })}
          </div>

          {/* Téléphone */}
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ex: 22961234567"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
          />

          <div className="flex gap-2">
            {editing && (
              <Button variant="ghost" size="sm" className="flex-1" onClick={() => setEditing(false)}>Annuler</Button>
            )}
            <Button
              size="sm"
              className="flex-1"
              onClick={handleSave}
              loading={upsert.isPending}
              disabled={phone.trim().length < 8}
            >
              {hasAccount ? "Mettre à jour" : "Enregistrer"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
