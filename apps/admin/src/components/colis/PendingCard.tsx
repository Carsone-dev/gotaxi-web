import { Package, MapPin, User, Phone, AlertCircle, ExternalLink } from "lucide-react";
import { Button, Badge } from "@gotaxi/ui";
import { useValidateColis, useRejectColis } from "@/hooks/useAdmin";
import { formatCurrency, formatRelativeTime, getMediaUrl } from "@/lib/format";
import { toast } from "sonner";
import { useState } from "react";
import type { ColisRead } from "@/types/domain";

interface PendingCardProps {
  colis: ColisRead;
  onViewDetail?: () => void;
}

export function PendingCard({ colis, onViewDetail }: PendingCardProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const validate = useValidateColis();
  const reject = useRejectColis();
  const photoUrl = getMediaUrl(colis.photo_url);

  const handleValidate = async () => {
    try {
      await validate.mutateAsync(colis.id);
      toast.success("Colis validé");
    } catch {
      toast.error("Erreur lors de la validation");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    try {
      await reject.mutateAsync({ colisId: colis.id, reason: rejectReason });
      toast.success("Colis refusé");
      setShowRejectForm(false);
    } catch {
      toast.error("Erreur lors du refus");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-white shadow-soft overflow-hidden">

      {/* ── Photo cover (si disponible) ── */}
      {photoUrl ? (
        <div className="relative h-44 w-full bg-surface">
          <img src={photoUrl} alt="Photo du colis" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <span className="rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              {colis.categorie}
            </span>
            {colis.fragile && (
              <span className="rounded-full bg-warning/85 px-2.5 py-0.5 text-xs font-semibold text-warning-text backdrop-blur-sm">
                ⚠ Fragile
              </span>
            )}
          </div>
          {onViewDetail && (
            <button
              type="button"
              onClick={onViewDetail}
              className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-xl bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
              title="Voir le détail"
            >
              <ExternalLink className="size-3.5" />
            </button>
          )}
        </div>
      ) : (
        /* Header sans photo */
        <div className="flex items-center gap-3 border-b border-border bg-warning-bg/30 px-4 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-warning-bg">
            <Package className="size-4 text-warning-text" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-warning-text">Aucune photo</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="warning">{colis.categorie}</Badge>
            {onViewDetail && (
              <button
                type="button"
                onClick={onViewDetail}
                className="flex size-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-ink"
                title="Voir le détail"
              >
                <ExternalLink className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Corps de la carte ── */}
      <div className="p-4 space-y-3">

        {/* Description + code suivi */}
        <div>
          <p className="text-sm font-bold leading-snug">{colis.description}</p>
          <p className="font-mono text-xs text-primary mt-0.5">{colis.code_suivi}</p>
        </div>

        {/* Infos grille */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{colis.ville_depart} → {colis.ville_arrivee}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="size-3 shrink-0" />
            <span className="truncate">{colis.destinataire_nom}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="size-3 shrink-0" />
            <span>{colis.destinataire_telephone}</span>
          </div>
          <div className="text-right font-semibold text-ink">
            {formatCurrency(colis.prix)}
          </div>
        </div>

        {/* Fragile (uniquement si pas de photo — déjà visible dans l'overlay sinon) */}
        {colis.fragile && !photoUrl && (
          <div className="flex items-center gap-1.5 rounded-lg bg-warning-bg px-3 py-1.5">
            <AlertCircle className="size-3.5 text-warning-text" />
            <span className="text-xs font-semibold text-warning-text">Fragile — manipuler avec précaution</span>
          </div>
        )}

        <p className="text-2xs text-muted-foreground">{formatRelativeTime(colis.created_at)}</p>

        {/* Actions */}
        {showRejectForm ? (
          <div className="space-y-2">
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motif du refus..."
              rows={2}
              className="w-full rounded-xl border border-border bg-surface p-2.5 text-xs outline-none resize-none focus:border-error/60"
            />
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={handleReject}
                loading={reject.isPending}
                disabled={!rejectReason.trim()}
              >
                Confirmer le refus
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowRejectForm(false)}>
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={handleValidate} loading={validate.isPending}>
              Valider
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setShowRejectForm(true)}>
              Refuser
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
