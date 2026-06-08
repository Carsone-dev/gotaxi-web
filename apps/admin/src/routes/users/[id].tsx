import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, Star, Calendar, Shield, CheckCircle, Clock, Package, MapPin } from "lucide-react";
import { Button, Spinner, Badge } from "@gotaxi/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useSuspendUser, useActivateUser, useAdminUserDetail } from "@/hooks/useAdmin";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { formatDate, formatDateTime, formatPhoneNumber, formatCurrency, getInitials } from "@/lib/format";
import { toast } from "sonner";
import type { AvisRead, ReservationRead, ReservationStatut } from "@/types/domain";

type Tab = "infos" | "reservations" | "avis";

const RESA_STATUT: Record<ReservationStatut, { label: string; variant: "success" | "info" | "warning" | "error" | "neutral" }> = {
  EN_ATTENTE: { label: "En attente", variant: "warning" },
  CONFIRMEE: { label: "Confirmée", variant: "success" },
  REFUSEE: { label: "Refusée", variant: "error" },
  ANNULEE: { label: "Annulée", variant: "neutral" },
  TERMINEE: { label: "Terminée", variant: "info" },
};

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("infos");
  const [suspendReason, setSuspendReason] = useState("");
  const [showSuspend, setShowSuspend] = useState(false);

  const { data: user, isLoading } = useAdminUserDetail(id!);
  const suspend = useSuspendUser();
  const activate = useActivateUser();

  const { data: reservations, isLoading: resaLoading } = useQuery({
    queryKey: ["admin", "reservations", { size: 50 }],
    queryFn: () => get<{ items: ReservationRead[] }>("/admin/reservations", { size: 50 }),
    enabled: tab === "reservations",
    select: (d) => d.items.filter((r) => r.client?.id === id),
  });

  const { data: avis, isLoading: avisLoading } = useQuery({
    queryKey: ["avis", "chauffeur", id, 1],
    queryFn: () => get<{ items: AvisRead[]; total: number }>(`/avis/chauffeur/${id}?page=1&size=20`),
    enabled: tab === "avis" && user?.role === "CHAUFFEUR",
    select: (d) => d.items,
  });

  if (isLoading) return <Spinner fullScreen />;
  if (!user) return <p className="p-8 text-center text-muted-foreground">Utilisateur introuvable</p>;

  const handleSuspend = async () => {
    try {
      await suspend.mutateAsync({ userId: user.id, reason: suspendReason });
      toast.success("Compte suspendu");
      setShowSuspend(false);
    } catch {
      toast.error("Erreur");
    }
  };

  const handleActivate = async () => {
    try {
      await activate.mutateAsync(user.id);
      toast.success("Compte réactivé");
    } catch {
      toast.error("Erreur");
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
        <div className="space-y-4">
          {/* Profil header */}
          <div className="flex items-center gap-5 rounded-2xl border border-border bg-white p-5">
            {user.photo_url ? (
              <img src={user.photo_url} alt="" className="size-20 rounded-2xl object-cover ring-2 ring-border" />
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
                  <span className="flex items-center gap-1 text-2xs text-success font-medium">
                    <CheckCircle className="size-3" /> Vérifié
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < Math.round(user.note_moyenne) ? "text-accent-yellow" : "text-muted"}>★</span>
                ))}
                <span className="ml-1 text-xs text-muted-foreground">{user.note_moyenne.toFixed(1)} ({user.nombre_avis} avis)</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
            {(["infos", "reservations", "avis"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                disabled={t === "avis" && user.role !== "CHAUFFEUR"}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors disabled:opacity-40 ${
                  tab === t ? "bg-white text-ink shadow-sm" : "text-muted-foreground hover:text-ink"
                }`}
              >
                {t === "infos" ? "Informations" : t === "reservations" ? "Réservations" : "Avis reçus"}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === "infos" && (
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="mb-4 text-sm font-bold">Informations du compte</h3>
              <dl className="space-y-3">
                <Detail icon={<Phone className="size-4" />} label="Téléphone" value={formatPhoneNumber(user.telephone)} />
                {user.email && <Detail icon={<Mail className="size-4" />} label="Email" value={user.email} />}
                <Detail icon={<Shield className="size-4" />} label="Rôle" value={user.role.replace(/_/g, " ")} />
                <Detail icon={<Star className="size-4" />} label="Note" value={`${user.note_moyenne.toFixed(1)} / 5 (${user.nombre_avis} avis)`} />
                <Detail icon={<Calendar className="size-4" />} label="Inscription" value={formatDate(user.created_at)} />
              </dl>
            </div>
          )}

          {tab === "reservations" && (
            <div className="rounded-2xl border border-border bg-white overflow-hidden">
              <div className="border-b border-border px-5 py-4">
                <h3 className="text-sm font-bold">Réservations</h3>
              </div>
              {resaLoading ? (
                <div className="flex justify-center p-8"><Spinner /></div>
              ) : !reservations?.length ? (
                <p className="p-8 text-center text-sm text-muted-foreground">Aucune réservation trouvée</p>
              ) : (
                <div className="divide-y divide-border">
                  {reservations.map((r) => {
                    const conf = RESA_STATUT[r.statut] ?? { label: r.statut, variant: "neutral" as const };
                    return (
                      <div
                        key={r.id}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface transition-colors cursor-pointer"
                        onClick={() => r.voyage_id && navigate(`/voyages/${r.voyage_id}`)}
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface">
                          <MapPin className="size-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {r.voyage ? `${r.voyage.ville_depart} → ${r.voyage.ville_arrivee}` : "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {r.voyage ? formatDateTime(r.voyage.date_depart) : ""} · {r.nombre_places} place(s)
                          </p>
                        </div>
                        <div className="text-right shrink-0">
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
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={i < a.note ? "text-accent-yellow" : "text-muted"}>★</span>
                              ))}
                            </div>
                            {a.signale && (
                              <span className="rounded-full bg-error px-2 py-0.5 text-2xs font-bold text-white">Signalé</span>
                            )}
                            {!a.visible && (
                              <span className="rounded-full bg-surface border border-border px-2 py-0.5 text-2xs text-muted-foreground">Masqué</span>
                            )}
                          </div>
                          {a.commentaire && <p className="mt-1.5 text-sm text-ink">{a.commentaire}</p>}
                          {a.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {a.tags.map((tag) => (
                                <span key={tag} className="rounded-full border border-border bg-surface px-2 py-0.5 text-2xs text-muted-foreground">{tag}</span>
                              ))}
                            </div>
                          )}
                          <p className="mt-1.5 text-2xs text-muted-foreground">{formatDate(a.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar actions */}
        <div className="space-y-3">
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
                    className="w-full rounded-xl border border-border bg-surface p-2.5 text-sm outline-none resize-none"
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
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowSuspend(false)}>
                    Annuler
                  </Button>
                </div>
              ) : (
                <Button variant="destructive" size="sm" className="mt-3 w-full" onClick={() => setShowSuspend(true)}>
                  Suspendre le compte
                </Button>
              )}
            </div>
          )}

          {user.statut === "SUSPENDU" && (
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm font-bold">Actions</p>
              <Button size="sm" className="mt-3 w-full" onClick={handleActivate} loading={activate.isPending}>
                Réactiver le compte
              </Button>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-white p-4 space-y-2.5">
            <p className="text-sm font-bold">Récapitulatif</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="size-3.5" /> Inscrit</span>
              <span className="font-medium">{formatDate(user.created_at)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><Package className="size-3.5" /> Avis</span>
              <span className="font-medium">{user.nombre_avis}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><Star className="size-3.5" /> Note</span>
              <span className="font-medium">{user.note_moyenne.toFixed(1)} / 5</span>
            </div>
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
