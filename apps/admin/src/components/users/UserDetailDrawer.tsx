import { useState } from "react";
import { X, Phone, Mail, Star, Calendar, Shield, Car } from "lucide-react";
import { Button } from "@gotaxi/ui";
import { UserStatusBadge } from "./UserStatusBadge";
import { useSuspendUser, useActivateUser, useConvertToDriver } from "@/hooks/useAdmin";
import { formatDate, formatPhoneNumber, getInitials, getMediaUrl } from "@/lib/format";
import { toast } from "sonner";
import type { UserRead } from "@/types/domain";

interface UserDetailDrawerProps {
  user: UserRead;
  onClose: () => void;
}

export function UserDetailDrawer({ user, onClose }: UserDetailDrawerProps) {
  const [suspendReason, setSuspendReason]   = useState("");
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [showConvert, setShowConvert]        = useState(false);

  const suspend       = useSuspendUser();
  const activate      = useActivateUser();
  const convertDriver = useConvertToDriver();

  const handleSuspend = async () => {
    try {
      await suspend.mutateAsync({ userId: user.id, reason: suspendReason });
      toast.success("Utilisateur suspendu");
      setShowSuspendForm(false);
      onClose();
    } catch {
      toast.error("Erreur lors de la suspension");
    }
  };

  const handleActivate = async () => {
    try {
      await activate.mutateAsync(user.id);
      toast.success("Utilisateur activé");
      onClose();
    } catch {
      toast.error("Erreur lors de l'activation");
    }
  };

  const handleConvert = async () => {
    try {
      await convertDriver.mutateAsync(user.id);
      toast.success("Compte converti — KYC en attente de soumission");
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur lors de la conversion";
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white shadow-elevated">

        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-base font-bold">Détail utilisateur</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-surface">
            <X className="size-4" />
          </button>
        </div>

        {/* Corps */}
        <div className="flex-1 space-y-4 p-4">
          {/* Avatar + nom */}
          <div className="flex items-center gap-4">
            {user.photo_url ? (
              <img src={getMediaUrl(user.photo_url) ?? ""} alt="" className="size-16 rounded-2xl object-cover ring-2 ring-border" />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-2xl bg-surface text-xl font-bold text-muted-foreground ring-2 ring-border">
                {getInitials(user.nom, user.prenom)}
              </div>
            )}
            <div>
              <p className="text-lg font-extrabold">{user.prenom} {user.nom}</p>
              <UserStatusBadge statut={user.statut} />
            </div>
          </div>

          {/* Infos */}
          <div className="rounded-2xl border border-border p-4 space-y-3">
            <InfoRow icon={<Phone className="size-3.5" />}    label="Téléphone"  value={formatPhoneNumber(user.telephone)} />
            {user.email && <InfoRow icon={<Mail className="size-3.5" />} label="Email" value={user.email} />}
            <InfoRow icon={<Shield className="size-3.5" />}   label="Rôle"       value={user.role.replace(/_/g, " ")} />
            <InfoRow icon={<Star className="size-3.5" />}     label="Note"       value={`${user.note_moyenne.toFixed(1)} (${user.nombre_avis} avis)`} />
            <InfoRow icon={<Calendar className="size-3.5" />} label="Inscription" value={formatDate(user.created_at)} />
          </div>

          {/* Formulaire de suspension */}
          {showSuspendForm && (
            <div className="rounded-2xl border border-error/30 bg-error-bg p-4 space-y-3">
              <p className="text-sm font-semibold text-error-text">Motif de suspension</p>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Indiquez la raison..."
                rows={3}
                className="w-full resize-none rounded-xl border border-border bg-white p-3 text-sm outline-none"
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleSuspend}
                  loading={suspend.isPending}
                  disabled={!suspendReason.trim()}
                  className="flex-1"
                >
                  Confirmer
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowSuspendForm(false)} className="flex-1">
                  Annuler
                </Button>
              </div>
            </div>
          )}

          {/* Confirmation conversion chauffeur */}
          {showConvert && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Car className="size-4 text-primary" />
                <p className="text-sm font-semibold">Confirmer la conversion</p>
              </div>
              <ul className="space-y-1.5 text-xs text-ink">
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Rôle : CLIENT → <strong>CHAUFFEUR</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-warning-text" />
                  Statut : <strong>EN_ATTENTE_KYC</strong>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground">
                L'utilisateur devra soumettre ses documents KYC depuis l'application mobile.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleConvert}
                  loading={convertDriver.isPending}
                  className="flex-1"
                >
                  Confirmer
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowConvert(false)} className="flex-1">
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Pied — actions */}
        <div className="border-t border-border p-4 space-y-2">
          {user.role === "CLIENT" && user.statut !== "SUPPRIME" && !showSuspendForm && !showConvert && (
            <Button
              variant="outline"
              className="w-full"
              leftIcon={<Car className="size-4" />}
              onClick={() => setShowConvert(true)}
            >
              Promouvoir en chauffeur
            </Button>
          )}
          {user.statut === "ACTIF" && !showSuspendForm && !showConvert && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowSuspendForm(true)}
            >
              Suspendre le compte
            </Button>
          )}
          {user.statut === "SUSPENDU" && !showConvert && (
            <Button
              className="w-full"
              onClick={handleActivate}
              loading={activate.isPending}
            >
              Réactiver le compte
            </Button>
          )}
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Fermer
          </Button>
        </div>

      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-muted-foreground">{icon}</span>
      <span className="w-20 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-sm font-medium">{value}</span>
    </div>
  );
}
