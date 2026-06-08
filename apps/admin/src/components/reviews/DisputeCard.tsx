import { AlertTriangle, ChevronRight } from "lucide-react";
import { Button } from "@gotaxi/ui";
import { formatRelativeTime } from "@/lib/format";
import type { AvisRead } from "@/types/domain";

interface DisputeCardProps {
  avis: AvisRead;
  onArbitrate?: (id: string) => void;
}

export function DisputeCard({ avis, onArbitrate }: DisputeCardProps) {
  return (
    <div className="rounded-2xl border border-warning/40 bg-warning-bg p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-warning/20">
          <AlertTriangle className="size-4 text-warning-text" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-warning-text">Litige signalé</p>
          {avis.commentaire && (
            <p className="mt-1 text-sm text-ink">{avis.commentaire}</p>
          )}
          <p className="mt-1.5 text-2xs text-muted-foreground">
            {formatRelativeTime(avis.created_at)}
          </p>
        </div>
      </div>

      {onArbitrate && (
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          rightIcon={<ChevronRight className="size-3.5" />}
          onClick={() => onArbitrate(avis.id)}
        >
          Arbitrer
        </Button>
      )}
    </div>
  );
}
