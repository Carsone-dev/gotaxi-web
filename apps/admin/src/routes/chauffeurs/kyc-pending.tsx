import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, ArrowLeft, FileText, Phone, Star, Car } from "lucide-react";
import { Button, Spinner } from "@gotaxi/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAdminChauffeurs, useValidateKyc, useRejectKyc } from "@/hooks/useAdmin";
import { getInitials, formatDate, getMediaUrl, formatPhoneNumber, formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import type { AdminChauffeurItem } from "@/types/domain";

export default function KycPendingPage() {
  // kyc_valide=false → chauffeur profile id available for validate/reject
  const { data, isLoading } = useAdminChauffeurs({ kyc_valide: false, size: 50 });
  const validateKyc = useValidateKyc();
  const rejectKyc   = useRejectKyc();
  const navigate    = useNavigate();

  // Per-card reject form state
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Show only those with user status EN_ATTENTE_KYC (submitted docs)
  const pending = (data?.items ?? []).filter(
    (c) => c.user?.statut === "EN_ATTENTE_KYC",
  );

  const handleValidate = async (chauffeur: AdminChauffeurItem) => {
    try {
      await validateKyc.mutateAsync(chauffeur.id); // chauffeur profile UUID — correct
      toast.success(`KYC de ${chauffeur.user?.prenom} ${chauffeur.user?.nom} validé`);
    } catch {
      toast.error("Erreur lors de la validation");
    }
  };

  const handleReject = async (chauffeur: AdminChauffeurItem) => {
    if (!rejectReason.trim()) return;
    try {
      await rejectKyc.mutateAsync({ chauffeurId: chauffeur.id, reason: rejectReason });
      toast.success(`KYC de ${chauffeur.user?.prenom} ${chauffeur.user?.nom} rejeté`);
      setRejectTarget(null);
      setRejectReason("");
    } catch {
      toast.error("Erreur lors du rejet");
    }
  };

  return (
    <>
      <PageHeader
        title="KYC en attente"
        subtitle={isLoading ? "Chargement…" : `${pending.length} chauffeur${pending.length !== 1 ? "s" : ""} à valider`}
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
          {pending.map((chauffeur) => {
            const u = chauffeur.user;
            const v = chauffeur.vehicules?.[0];
            const isRejectOpen = rejectTarget === chauffeur.id;

            return (
              <div
                key={chauffeur.id}
                className="rounded-2xl border border-border bg-white p-5 shadow-soft flex flex-col gap-4"
              >
                {/* Header */}
                <div className="flex items-start gap-4">
                  {u?.photo_url ? (
                    <img
                      src={getMediaUrl(u.photo_url) ?? ""}
                      alt=""
                      className="size-12 rounded-xl object-cover ring-2 ring-border"
                    />
                  ) : (
                    <div className="flex size-12 items-center justify-center rounded-xl bg-surface text-lg font-bold text-muted-foreground ring-2 ring-border">
                      {getInitials(u?.nom ?? "?", u?.prenom ?? "")}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">{u?.prenom} {u?.nom}</p>
                    {u?.telephone && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Phone className="size-3" />{formatPhoneNumber(u.telephone)}
                      </p>
                    )}
                    {u?.created_at && (
                      <p className="text-xs text-muted-foreground">
                        Inscrit le {formatDate(u.created_at)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats rapides */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-surface p-2.5 text-center">
                    <p className="text-sm font-bold">{chauffeur.nombre_trajets}</p>
                    <p className="text-2xs text-muted-foreground">Trajets</p>
                  </div>
                  <div className="rounded-xl bg-surface p-2.5 text-center">
                    <p className="flex items-center justify-center gap-0.5 text-sm font-bold">
                      <Star className="size-3 fill-accent-yellow text-accent-yellow" />
                      {u?.note_moyenne.toFixed(1) ?? "—"}
                    </p>
                    <p className="text-2xs text-muted-foreground">Note</p>
                  </div>
                  <div className="rounded-xl bg-surface p-2.5 text-center">
                    <p className="text-xs font-bold leading-tight">{formatCurrency(chauffeur.revenus_total)}</p>
                    <p className="text-2xs text-muted-foreground">Revenus</p>
                  </div>
                </div>

                {/* Véhicule */}
                {v ? (
                  <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5">
                    <Car className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{v.marque} {v.modele} ({v.annee})</p>
                      <p className="text-xs text-muted-foreground">{v.immatriculation} · {v.nombre_places} pl.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2.5">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Documents soumis pour validation</span>
                  </div>
                )}

                {/* Formulaire de rejet */}
                {isRejectOpen && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-error">Motif du rejet (obligatoire)</p>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Ex : Photo illisible, document expiré…"
                      rows={2}
                      className="w-full resize-none rounded-xl border border-error/40 bg-surface p-2.5 text-sm outline-none focus:border-error"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  {!isRejectOpen ? (
                    <>
                      <Button
                        size="sm"
                        className="flex-1"
                        leftIcon={<CheckCircle className="size-4" />}
                        onClick={() => handleValidate(chauffeur)}
                        loading={validateKyc.isPending && validateKyc.variables === chauffeur.id}
                      >
                        Valider
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<XCircle className="size-4" />}
                        onClick={() => { setRejectTarget(chauffeur.id); setRejectReason(""); }}
                      >
                        Rejeter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/chauffeurs/${u?.id}`)}
                      >
                        Profil
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleReject(chauffeur)}
                        loading={rejectKyc.isPending}
                        disabled={!rejectReason.trim()}
                      >
                        Confirmer le rejet
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setRejectTarget(null); setRejectReason(""); }}
                      >
                        Annuler
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
