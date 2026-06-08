import { Package, MapPin, User, Phone, AlertCircle } from "lucide-react";
import { Button, Badge } from "@gotaxi/ui";
import { useValidateColis, useRejectColis } from "@/hooks/useAdmin";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { toast } from "sonner";
import { useState } from "react";
import type { ColisRead } from "@/types/domain";

interface PendingCardProps {
  colis: ColisRead;
}

export function PendingCard({ colis }: PendingCardProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const validate = useValidateColis();
  const reject = useRejectColis();

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
    <div className="rounded-2xl border border-border bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-warning-bg">
            <Package className="size-4 text-warning-text" />
          </div>
          <div>
            <p className="text-sm font-bold">{colis.description}</p>
            <p className="font-mono text-xs text-primary">{colis.code_suivi}</p>
          </div>
        </div>
        <Badge variant="warning" className="shrink-0">
          {colis.categorie}
        </Badge>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="size-3 shrink-0" />
          <span>{colis.ville_depart} → {colis.ville_arrivee}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="size-3 shrink-0" />
          <span>{colis.destinataire_nom}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Phone className="size-3 shrink-0" />
          <span>{colis.destinataire_telephone}</span>
        </div>
        <div className="text-right font-semibold text-ink">
          {formatCurrency(colis.prix)}
        </div>
      </div>

      {colis.fragile && (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-warning-bg px-3 py-1.5">
          <AlertCircle className="size-3.5 text-warning-text" />
          <span className="text-xs font-semibold text-warning-text">Fragile</span>
        </div>
      )}

      <p className="mt-2 text-2xs text-muted-foreground">
        {formatRelativeTime(colis.created_at)}
      </p>

      {showRejectForm ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motif du refus..."
            rows={2}
            className="w-full rounded-xl border border-border bg-surface p-2.5 text-xs outline-none resize-none"
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRejectForm(false)}
            >
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={handleValidate}
            loading={validate.isPending}
          >
            Valider
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowRejectForm(true)}
          >
            Refuser
          </Button>
        </div>
      )}
    </div>
  );
}
