import { Flag } from "lucide-react";
import { Button } from "@gotaxi/ui";
import { formatRelativeTime } from "@/lib/format";
import type { AvisRead } from "@/types/domain";

interface ReviewCardProps {
  avis: AvisRead;
  onFlag?: (id: string) => void;
}

function StarRating({ note }: { note: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < note ? "text-accent-yellow" : "text-muted"}>
          ★
        </span>
      ))}
    </div>
  );
}

export function ReviewCard({ avis, onFlag }: ReviewCardProps) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        avis.signale ? "border-error/30 bg-error-bg" : "border-border bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <StarRating note={avis.note} />
            {avis.signale && (
              <span className="rounded-full bg-error px-2 py-0.5 text-2xs font-bold text-white">
                Signalé
              </span>
            )}
          </div>
          {avis.commentaire && (
            <p className="mt-2 text-sm text-ink">{avis.commentaire}</p>
          )}
          {avis.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {avis.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-2xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p className="mt-2 text-2xs text-muted-foreground">
            {formatRelativeTime(avis.created_at)}
          </p>
        </div>

        {!avis.signale && onFlag && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFlag(avis.id)}
            className="text-muted-foreground hover:text-error"
          >
            <Flag className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
