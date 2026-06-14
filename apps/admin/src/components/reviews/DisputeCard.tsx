import { AlertTriangle, EyeOff, Eye, ExternalLink } from "lucide-react";
import { Button } from "@gotaxi/ui";
import { formatRelativeTime, getMediaUrl } from "@/lib/format";
import { Link } from "react-router-dom";
import type { AdminAvisItem } from "@/types/domain";

interface DisputeCardProps {
  avis: AdminAvisItem;
  onMasquer?: (id: string) => void;
  onRestaurer?: (id: string) => void;
  isLoading?: boolean;
}

function UserMini({ user }: { user: AdminAvisItem["auteur"] }) {
  if (!user) return <span className="text-muted-foreground italic text-xs">Inconnu</span>;
  return (
    <Link to={`/users/${user.id}`} className="flex items-center gap-1.5 group">
      {user.photo_url ? (
        <img src={getMediaUrl(user.photo_url) ?? ""} alt="" className="size-5 rounded-full object-cover" />
      ) : (
        <div className="flex size-5 items-center justify-center rounded-full bg-white/60 text-2xs font-bold text-warning-text">
          {user.prenom[0]}{user.nom[0]}
        </div>
      )}
      <span className="text-xs font-semibold text-warning-text group-hover:underline">
        {user.prenom} {user.nom}
      </span>
      <ExternalLink className="size-2.5 opacity-0 group-hover:opacity-100 text-warning-text" />
    </Link>
  );
}

export function DisputeCard({ avis, onMasquer, onRestaurer, isLoading }: DisputeCardProps) {
  const isMasque = !avis.visible;

  return (
    <div className="rounded-2xl border border-warning/40 bg-warning-bg p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-warning/20">
          <AlertTriangle className="size-4 text-warning-text" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-warning-text">Avis signalé</p>
            <div className="flex gap-0.5 ml-auto">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < avis.note ? "text-accent-yellow" : "text-muted"}>★</span>
              ))}
            </div>
          </div>

          {avis.commentaire && (
            <p className="mt-1 text-sm text-ink">{avis.commentaire}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-2xs text-warning-text/70 uppercase tracking-wide">De</span>
              <UserMini user={avis.auteur} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xs text-warning-text/70 uppercase tracking-wide">Pour</span>
              <UserMini user={avis.cible} />
            </div>
          </div>

          <div className="mt-1.5 flex items-center gap-2">
            <p className="text-2xs text-muted-foreground">{formatRelativeTime(avis.created_at)}</p>
            {isMasque && (
              <span className="rounded-full bg-surface px-2 py-0.5 text-2xs font-semibold text-muted-foreground">
                Masqué
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {!isMasque && onMasquer && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            leftIcon={<EyeOff className="size-3.5" />}
            onClick={() => onMasquer(avis.id)}
            disabled={isLoading}
          >
            Masquer
          </Button>
        )}
        {isMasque && onRestaurer && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            leftIcon={<Eye className="size-3.5" />}
            onClick={() => onRestaurer(avis.id)}
            disabled={isLoading}
          >
            Restaurer
          </Button>
        )}
      </div>
    </div>
  );
}
