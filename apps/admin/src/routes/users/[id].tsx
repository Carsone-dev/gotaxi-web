import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Phone, Mail, Star, Calendar, Shield, CheckCircle,
  Clock, MapPin, Package, Banknote, Trash2, AlertTriangle, Car,
} from "lucide-react";
import { Button, Spinner, Badge } from "@gotaxi/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  useSuspendUser, useActivateUser, useAdminUserDetail,
  useDeleteUser, useAdminUserReservations, useAdminUserColis, useAdminUserTransactions,
  useConvertToDriver,
} from "@/hooks/useAdmin";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { formatDate, formatDateTime, formatPhoneNumber, formatCurrency, getInitials, getMediaUrl } from "@/lib/format";
import { toast } from "sonner";
import type {
  AvisRead, ReservationStatut, ColisStatut, TransactionStatut, TransactionOperateur,
} from "@/types/domain";

type Tab = "infos" | "reservations" | "colis" | "transactions" | "avis";

const RESA_STATUT: Record<ReservationStatut, { label: string; variant: "success" | "info" | "warning" | "error" | "neutral" }> = {
  EN_ATTENTE_PAIEMENT: { label: "Paiement en attente", variant: "warning" },
  EN_ATTENTE:  { label: "En attente", variant: "warning" },
  CONFIRMEE:   { label: "Confirmée",  variant: "success" },
  REFUSEE:     { label: "Refusée",    variant: "error"   },
  ANNULEE:     { label: "Annulée",    variant: "neutral" },
  TERMINEE:    { label: "Terminée",   variant: "info"    },
};

const COLIS_STATUT: Record<ColisStatut, { label: string; variant: "success" | "info" | "warning" | "error" | "neutral" }> = {
  EN_ATTENTE_PAIEMENT: { label: "Paiement en attente", variant: "warning" },
  EN_ATTENTE: { label: "En attente",  variant: "warning" },
  CONFIRME:   { label: "Confirmé",    variant: "info"    },
  EN_TRANSIT: { label: "En transit",  variant: "info"    },
  LIVRE:      { label: "Livré",       variant: "success" },
  ANNULE:     { label: "Annulé",      variant: "neutral" },
};

const TX_STATUT: Record<TransactionStatut, { label: string; variant: "success" | "info" | "warning" | "error" | "neutral" }> = {
  REUSSI:     { label: "Réussi",      variant: "success" },
  EN_ATTENTE: { label: "En attente",  variant: "warning" },
  EN_COURS:   { label: "En cours",    variant: "info"    },
  ECHEC:      { label: "Échoué",      variant: "error"   },
  ANNULE:     { label: "Annulé",      variant: "neutral" },
};

const OP_COLOR: Record<TransactionOperateur, string> = {
  FEDAPAY:      "bg-emerald-500",
  MTN_MOMO:     "bg-yellow-400",
  MOOV_MONEY:   "bg-sky-400",
  ORANGE_MONEY: "bg-orange-400",
  CELTIS:       "bg-purple-400",
  WALLET:       "bg-primary",
};

const TAB_LABELS: Record<Tab, string> = {
  infos:        "Informations",
  reservations: "Réservations",
  colis:        "Colis",
  transactions: "Transactions",
  avis:         "Avis reçus",
};

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tab, setTab]                   = useState<Tab>("infos");
  const [suspendReason, setSuspendReason] = useState("");
  const [showSuspend, setShowSuspend]   = useState(false);
  const [showDelete, setShowDelete]     = useState(false);
  const [showConvert, setShowConvert]   = useState(false);

  const { data: user, isLoading } = useAdminUserDetail(id!);
  const suspend       = useSuspendUser();
  const activate      = useActivateUser();
  const deleteUser    = useDeleteUser();
  const convertDriver = useConvertToDriver();

  // Données des onglets — chargées uniquement quand l'onglet est actif
  const { data: resaData,  isLoading: resaLoading  } = useAdminUserReservations(id!, tab === "reservations");
  const { data: colisData, isLoading: colisLoading } = useAdminUserColis(id!, tab === "colis");
  const { data: txData,    isLoading: txLoading    } = useAdminUserTransactions(id!, tab === "transactions");

  const { data: avis, isLoading: avisLoading } = useQuery({
    queryKey: ["avis", "chauffeur", id, 1],
    queryFn: () => get<{ items: AvisRead[]; total: number }>(`/avis/chauffeur/${id}?page=1&size=20`),
    enabled: tab === "avis" && user?.role === "CHAUFFEUR",
    select: (d) => d.items,
  });

  if (isLoading) return <Spinner fullScreen />;
  if (!user) return <p className="p-8 text-center text-muted-foreground">Utilisateur introuvable</p>;

  const reservations = resaData?.items ?? [];
  const colis = colisData?.items ?? [];
  const transactions = txData?.items ?? [];

  const visibleTabs: Tab[] = user.role === "CHAUFFEUR"
    ? ["infos", "reservations", "colis", "transactions", "avis"]
    : ["infos", "reservations", "colis", "transactions"];

  const handleSuspend = async () => {
    try {
      await suspend.mutateAsync({ userId: user.id, reason: suspendReason });
      toast.success("Compte suspendu");
      setShowSuspend(false);
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

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(user.id);
      toast.success("Compte supprimé");
      navigate(-1);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleConvertToDriver = async () => {
    try {
      await convertDriver.mutateAsync(user.id);
      toast.success("Compte converti en chauffeur — KYC en attente");
      setShowConvert(false);
      navigate(`/chauffeurs/${user.id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur lors de la conversion";
      toast.error(msg);
    }
  };

  return (
    <>
      <PageHeader
        title={`${user.prenom} ${user.nom}`}
        subtitle={formatPhoneNumber(user.telephone)}
        actions={
          <Button variant="ghost" leftIcon={<ArrowLeft className="size-4" />} onClick={() => navigate(-1)}>
            Retour
          </Button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Colonne principale */}
        <div className="space-y-4">
          {/* En-tête profil */}
          <div className="flex items-center gap-5 rounded-2xl border border-border bg-white p-5">
            {user.photo_url ? (
              <img src={getMediaUrl(user.photo_url) ?? ""} alt="" className="size-20 rounded-2xl object-cover ring-2 ring-border" />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-2xl bg-surface text-2xl font-extrabold text-muted-foreground ring-2 ring-border">
                {getInitials(user.nom, user.prenom)}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-extrabold">{user.prenom} {user.nom}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <UserStatusBadge statut={user.statut} />
                <Badge variant="secondary">{user.role.replace(/_/g, " ")}</Badge>
                {user.telephone_verifie && (
                  <span className="flex items-center gap-1 text-xs text-success font-medium">
                    <CheckCircle className="size-3" /> Vérifié
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-3.5 ${i < Math.round(user.note_moyenne) ? "fill-accent-yellow text-accent-yellow" : "fill-none text-muted"}`}
                  />
                ))}
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {user.note_moyenne.toFixed(1)} ({user.nombre_avis} avis)
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1">
            {visibleTabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                  tab === t ? "bg-white text-ink shadow-sm" : "text-muted-foreground hover:text-ink"
                }`}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>

          {/* ── Onglet Informations ─────────────────────────────── */}
          {tab === "infos" && (
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="mb-4 text-sm font-bold">Informations du compte</h3>
              <dl className="space-y-3">
                <Detail icon={<Phone className="size-4" />}   label="Téléphone"  value={formatPhoneNumber(user.telephone)} />
                {user.email && <Detail icon={<Mail className="size-4" />} label="Email" value={user.email} />}
                <Detail icon={<Shield className="size-4" />}  label="Rôle"       value={user.role.replace(/_/g, " ")} />
                <Detail icon={<Star className="size-4" />}    label="Note"       value={`${user.note_moyenne.toFixed(1)} / 5 (${user.nombre_avis} avis)`} />
                <Detail icon={<Calendar className="size-4" />} label="Inscription" value={formatDate(user.created_at)} />
              </dl>
            </div>
          )}

          {/* ── Onglet Réservations ─────────────────────────────── */}
          {tab === "reservations" && (
            <div className="rounded-2xl border border-border bg-white overflow-hidden">
              <div className="border-b border-border px-5 py-4">
                <h3 className="text-sm font-bold">Réservations</h3>
              </div>
              {resaLoading ? (
                <div className="flex justify-center p-8"><Spinner /></div>
              ) : !reservations.length ? (
                <p className="p-8 text-center text-sm text-muted-foreground">Aucune réservation</p>
              ) : (
                <div className="divide-y divide-border">
                  {reservations.map((r) => {
                    const conf = RESA_STATUT[r.statut] ?? { label: r.statut, variant: "neutral" as const };
                    return (
                      <div
                        key={r.id}
                        className="flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface"
                        onClick={() => r.voyage_id && navigate(`/voyages/${r.voyage_id}`)}
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface">
                          <MapPin className="size-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {r.voyage ? `${r.voyage.ville_depart} → ${r.voyage.ville_arrivee}` : "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {r.voyage ? formatDateTime(r.voyage.date_depart) : ""}
                            {" · "}{r.nombre_places} place(s)
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold">{formatCurrency(r.prix_total)}</p>
                          <StatusBadge label={conf.label} variant={conf.variant} dot />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Onglet Colis ────────────────────────────────────── */}
          {tab === "colis" && (
            <div className="rounded-2xl border border-border bg-white overflow-hidden">
              <div className="border-b border-border px-5 py-4">
                <h3 className="text-sm font-bold">Colis envoyés</h3>
              </div>
              {colisLoading ? (
                <div className="flex justify-center p-8"><Spinner /></div>
              ) : !colis.length ? (
                <p className="p-8 text-center text-sm text-muted-foreground">Aucun colis</p>
              ) : (
                <div className="divide-y divide-border">
                  {colis.map((c) => {
                    const conf = COLIS_STATUT[c.statut] ?? { label: c.statut, variant: "neutral" as const };
                    return (
                      <div
                        key={c.id}
                        className="flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface"
                        onClick={() => navigate(`/colis/${c.id}`)}
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface">
                          <Package className="size-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {c.ville_depart} → {c.ville_arrivee}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.description} · {c.destinataire_nom}
                            {" · "}{formatDate(c.created_at)}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold">{formatCurrency(c.prix)}</p>
                          <StatusBadge label={conf.label} variant={conf.variant} dot />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Onglet Transactions ─────────────────────────────── */}
          {tab === "transactions" && (
            <div className="rounded-2xl border border-border bg-white overflow-hidden">
              <div className="border-b border-border px-5 py-4">
                <h3 className="text-sm font-bold">Transactions</h3>
              </div>
              {txLoading ? (
                <div className="flex justify-center p-8"><Spinner /></div>
              ) : !transactions.length ? (
                <p className="p-8 text-center text-sm text-muted-foreground">Aucune transaction</p>
              ) : (
                <div className="divide-y divide-border">
                  {transactions.map((tx) => {
                    const conf = TX_STATUT[tx.statut] ?? { label: tx.statut, variant: "neutral" as const };
                    return (
                      <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface">
                          <Banknote className="size-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-2 text-sm font-semibold">
                            <span className={`size-2 rounded-full ${OP_COLOR[tx.operateur] ?? "bg-muted"}`} />
                            {tx.operateur}
                            <span className="text-xs font-normal text-muted-foreground capitalize">
                              · {tx.type.toLowerCase()}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(tx.created_at)}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold">{formatCurrency(tx.montant)}</p>
                          <StatusBadge label={conf.label} variant={conf.variant} dot />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Onglet Avis reçus (CHAUFFEUR uniquement) ───────── */}
          {tab === "avis" && user.role === "CHAUFFEUR" && (
            <div className="rounded-2xl border border-border bg-white overflow-hidden">
              <div className="border-b border-border px-5 py-4">
                <h3 className="text-sm font-bold">Avis reçus</h3>
              </div>
              {avisLoading ? (
                <div className="flex justify-center p-8"><Spinner /></div>
              ) : !avis?.length ? (
                <p className="p-8 text-center text-sm text-muted-foreground">Aucun avis</p>
              ) : (
                <div className="divide-y divide-border">
                  {avis.map((a) => (
                    <div key={a.id} className="px-5 py-4">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3.5 ${i < a.note ? "fill-accent-yellow text-accent-yellow" : "fill-none text-muted"}`}
                          />
                        ))}
                        {a.signale && (
                          <span className="ml-2 rounded-full bg-error px-2 py-0.5 text-xs font-bold text-white">Signalé</span>
                        )}
                        {!a.visible && (
                          <span className="ml-1 rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-muted-foreground">Masqué</span>
                        )}
                      </div>
                      {a.commentaire && <p className="mt-1.5 text-sm text-ink">{a.commentaire}</p>}
                      {a.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {a.tags.map((tag) => (
                            <span key={tag} className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="mt-1.5 text-xs text-muted-foreground">{formatDate(a.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Suspendre */}
          {user.statut === "ACTIF" && (
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm font-bold">Actions</p>
              {showSuspend ? (
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
                    onClick={() => { setShowSuspend(false); setSuspendReason(""); }}
                  >
                    Annuler
                  </Button>
                </div>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => setShowSuspend(true)}
                >
                  Suspendre le compte
                </Button>
              )}
            </div>
          )}

          {/* Réactiver */}
          {user.statut === "SUSPENDU" && (
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm font-bold">Actions</p>
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

          {/* Lien vers le profil chauffeur */}
          {user.role === "CHAUFFEUR" && (
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm font-bold">Profil chauffeur</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                leftIcon={<Car className="size-4" />}
                onClick={() => navigate(`/chauffeurs/${user.id}`)}
              >
                Voir profil chauffeur
              </Button>
            </div>
          )}

          {/* Promouvoir en chauffeur */}
          {user.role === "CLIENT" && user.statut !== "SUPPRIME" && (
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm font-bold">Devenir chauffeur</p>
              {showConvert ? (
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl border border-border bg-surface p-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-ink">
                      <Car className="size-3.5 shrink-0 text-primary" />
                      <span>Rôle : CLIENT → <strong>CHAUFFEUR</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ink">
                      <Clock className="size-3.5 shrink-0 text-warning-text" />
                      <span>Statut : <strong>EN_ATTENTE_KYC</strong></span>
                    </div>
                    <p className="pt-1 text-xs text-muted-foreground">
                      Un profil chauffeur vide sera créé. L'utilisateur devra soumettre ses documents KYC depuis l'application mobile.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={handleConvertToDriver}
                    loading={convertDriver.isPending}
                  >
                    Confirmer la conversion
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowConvert(false)}
                  >
                    Annuler
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  leftIcon={<Car className="size-4" />}
                  onClick={() => setShowConvert(true)}
                >
                  Promouvoir en chauffeur
                </Button>
              )}
            </div>
          )}

          {/* Supprimer (soft delete) */}
          {user.statut !== "SUPPRIME" && (
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm font-bold">Zone dangereuse</p>
              {showDelete ? (
                <div className="mt-3 space-y-3">
                  <div className="flex items-start gap-2 rounded-xl bg-error/5 border border-error/20 p-3">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-error" />
                    <p className="text-xs text-error">
                      Le compte sera marqué comme supprimé (soft delete). Les données sont conservées pour l'audit.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={handleDelete}
                    loading={deleteUser.isPending}
                  >
                    Confirmer la suppression
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowDelete(false)}
                  >
                    Annuler
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full text-error hover:bg-error/5 hover:text-error"
                  leftIcon={<Trash2 className="size-4" />}
                  onClick={() => setShowDelete(true)}
                >
                  Supprimer le compte
                </Button>
              )}
            </div>
          )}

          {/* Récapitulatif */}
          <div className="rounded-2xl border border-border bg-white p-4 space-y-2.5">
            <p className="text-sm font-bold">Récapitulatif</p>
            <SummaryRow icon={<Clock className="size-3.5" />}   label="Inscrit"     value={formatDate(user.created_at)} />
            <SummaryRow icon={<Star className="size-3.5" />}    label="Note"        value={`${user.note_moyenne.toFixed(1)} / 5`} />
            <SummaryRow icon={<Package className="size-3.5" />} label="Avis reçus" value={String(user.nombre_avis)} />
          </div>
        </div>
      </div>
    </>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground">{icon}</span>
      <dt className="w-28 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-1.5 text-muted-foreground">{icon}{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
