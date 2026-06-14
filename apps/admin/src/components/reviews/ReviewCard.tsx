import { EyeOff, Eye, ExternalLink } from "lucide-react";
import { Button } from "@gotaxi/ui";
import { formatRelativeTime, getMediaUrl } from "@/lib/format";
import { Link } from "react-router-dom";
import type { AdminAvisItem } from "@/types/domain";

interface ReviewCardProps {
  avis: AdminAvisItem;
  onMasquer?: (id: string) => void;
  onRestaurer?: (id: string) => void;
  isLoading?: boolean;
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

function UserChip({ user, label }: { user: AdminAvisItem["auteur"]; label: string }) {
  if (!user) return <span className="text-muted-foreground italic">{label} inconnu</span>;
  return (
    <Link
      to={`/users/${user.id}`}
      className="flex items-center gap-1.5 group"
      title={`Voir ${label}`}
    >
      {user.photo_url ? (
        <img
          src={getMediaUrl(user.photo_url) ?? ""}
          alt=""
          className="size-5 rounded-full object-cover"
        />
      ) : (
        <div className="flex size-5 items-center justify-center rounded-full bg-surface text-2xs font-bold text-muted-foreground">
          {user.prenom[0]}{user.nom[0]}
        </div>
      )}
      <span className="text-xs font-medium text-ink group-hover:text-primary transition-colors">
        {user.prenom} {user.nom}
      </span>
      <ExternalLink className="size-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

export function ReviewCard({ avis, onMasquer, onRestaurer, isLoading }: ReviewCardProps) {
  const isMasque = !avis.visible;

  return (
    <div
      className={`rounded-2xl border p-4 transition-opacity ${
        avis.signale
          ? "border-error/30 bg-error-bg"
          : isMasque
          ? "border-border bg-surface opacity-70"
          : "border-border bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StarRating note={avis.note} />
            {avis.signale && (
              <span className="rounded-full bg-error px-2 py-0.5 text-2xs font-bold text-white">
                Signalé
              </span>
            )}
            {isMasque && (
              <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-2xs font-semibold text-muted-foreground">
                Masqué
              </span>
            )}
          </div>

          {avis.commentaire && (
            <p className="mt-2 text-sm text-ink leading-relaxed">{avis.commentaire}</p>
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

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-2xs text-muted-foreground uppercase tracking-wide">De</span>
              <UserChip user={avis.auteur} label="Auteur" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xs text-muted-foreground uppercase tracking-wide">Pour</span>
              <UserChip user={avis.cible} label="Cible" />
            </div>
            <span className="text-2xs text-muted-foreground ml-auto">
              {formatRelativeTime(avis.created_at)}
            </span>
          </div>
        </div>
      </div>

      {(onMasquer || onRestaurer) && (
        <div className="mt-3 flex gap-2 border-t border-border pt-3">
          {!isMasque && onMasquer && (
            <Button
              variant="outline"
              size="sm"
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
              leftIcon={<Eye className="size-3.5" />}
              onClick={() => onRestaurer(avis.id)}
              disabled={isLoading}
            >
              Restaurer
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
