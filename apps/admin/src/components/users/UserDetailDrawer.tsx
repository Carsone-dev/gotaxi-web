import { useState } from "react";
import { X, Phone, Mail, Star, Calendar, Shield } from "lucide-react";
import { Button } from "@gotaxi/ui";
import { UserStatusBadge } from "./UserStatusBadge";
import { useSuspendUser, useActivateUser } from "@/hooks/useAdmin";
import { formatDate, formatPhoneNumber, getInitials, formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import type { UserRead } from "@/types/domain";

interface UserDetailDrawerProps {
  user: UserRead;
  onClose: () => void;
}

export function UserDetailDrawer({ user, onClose }: UserDetailDrawerProps) {
  const [suspendReason, setSuspendReason] = useState("");
  const [showSuspendForm, setShowSuspendForm] = useState(false);

  const suspend = useSuspendUser();
  const activate = useActivateUser();

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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white shadow-elevated">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-base font-bold">Détail utilisateur</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-surface">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 p-4 space-y-4">
          <div className="flex items-center gap-4">
            {user.photo_url ? (
              <img
                src={user.photo_url}
                alt=""
                className="size-16 rounded-2xl object-cover ring-2 ring-border"
              />
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

          <div className="rounded-2xl border border-border p-4 space-y-3">
            <InfoRow icon={<Phone className="size-3.5" />} label="Téléphone" value={formatPhoneNumber(user.telephone)} />
            {user.email && <InfoRow icon={<Mail className="size-3.5" />} label="Email" value={user.email} />}
            <InfoRow icon={<Shield className="size-3.5" />} label="Rôle" value={user.role.replace("_", " ")} />
            <InfoRow
              icon={<Star className="size-3.5" />}
              label="Note"
              value={`${user.note_moyenne.toFixed(1)} (${user.nombre_avis} avis)`}
            />
            <InfoRow
              icon={<Calendar className="size-3.5" />}
              label="Inscription"
              value={formatDate(user.created_at)}
            />
          </div>

          {showSuspendForm && (
            <div className="rounded-2xl border border-error/30 bg-error-bg p-4 space-y-3">
              <p className="text-sm font-semibold text-error-text">Motif de suspension</p>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Indiquez la raison..."
                rows={3}
                className="w-full rounded-xl border border-border bg-white p-3 text-sm outline-none resize-none"
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
        </div>

        <div className="border-t border-border p-4 space-y-2">
          {user.statut === "ACTIF" && !showSuspendForm && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowSuspendForm(true)}
            >
              Suspendre le compte
            </Button>
          )}
          {user.statut === "SUSPENDU" && (
            <Button
              variant="primary"
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

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="text-sm font-medium truncate">{value}</span>
    </div>
  );
}
