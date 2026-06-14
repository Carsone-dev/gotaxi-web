import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { Spinner } from "@gotaxi/ui";
import {
  Star, AlertTriangle, EyeOff, MessageSquare, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useAdminAvis, useMasquerAvis, useRestaureAvis } from "@/hooks/useAdmin";
import { toast } from "sonner";

type FilterMode = "all" | "signale" | "masque";

const STAR_FILTERS = [1, 2, 3, 4, 5] as const;

export default function ReviewsPage() {
  const [mode, setMode] = useState<FilterMode>("all");
  const [noteFilter, setNoteFilter] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const params = {
    page,
    size: 24,
    ...(mode === "signale" ? { signale: true } : {}),
    ...(mode === "masque" ? { visible: false } : {}),
    ...(noteFilter !== null ? { note: noteFilter } : {}),
  };

  const { data, isLoading } = useAdminAvis(params);
  const masquer = useMasquerAvis();
  const restaurer = useRestaureAvis();

  // Summary counts (always fetch all for stats without page restriction)
  const { data: allData } = useAdminAvis({ size: 1 });
  const { data: signaleData } = useAdminAvis({ signale: true, size: 1 });
  const { data: masqueData } = useAdminAvis({ visible: false, size: 1 });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.pages ?? 1;

  async function handleMasquer(id: string) {
    try {
      await masquer.mutateAsync(id);
      toast.success("Avis masqué");
    } catch {
      toast.error("Erreur lors du masquage");
    }
  }

  async function handleRestaurer(id: string) {
    try {
      await restaurer.mutateAsync(id);
      toast.success("Avis restauré");
    } catch {
      toast.error("Erreur lors de la restauration");
    }
  }

  function setModeAndReset(m: FilterMode) {
    setMode(m);
    setPage(1);
  }

  function setNoteAndReset(n: number | null) {
    setNoteFilter(n);
    setPage(1);
  }

  const statCards = [
    {
      label: "Total avis",
      value: allData?.total ?? "—",
      icon: <MessageSquare className="size-5 text-primary" />,
      bg: "bg-primary/10",
      active: mode === "all" && noteFilter === null,
      onClick: () => { setModeAndReset("all"); setNoteFilter(null); },
    },
    {
      label: "Signalés",
      value: signaleData?.total ?? "—",
      icon: <AlertTriangle className="size-5 text-error" />,
      bg: "bg-error-bg",
      active: mode === "signale",
      onClick: () => { setModeAndReset("signale"); setNoteFilter(null); },
    },
    {
      label: "Masqués",
      value: masqueData?.total ?? "—",
      icon: <EyeOff className="size-5 text-muted-foreground" />,
      bg: "bg-surface",
      active: mode === "masque",
      onClick: () => { setModeAndReset("masque"); setNoteFilter(null); },
    },
  ];

  return (
    <>
      <PageHeader
        title="Avis & modération"
        subtitle={`${total} résultat${total !== 1 ? "s" : ""}`}
        actions={
          signaleData?.total ? (
            <Link to="/reviews/disputes">
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl bg-error px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-error/90 transition-colors"
              >
                <AlertTriangle className="size-4" />
                {signaleData.total} signalé{signaleData.total !== 1 ? "s" : ""}
              </button>
            </Link>
          ) : undefined
        }
      />

      {/* Stat cards */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {statCards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={card.onClick}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
              card.active
                ? "border-primary/30 ring-2 ring-primary/20 bg-white shadow-soft"
                : "border-border bg-white hover:border-border/80 hover:shadow-soft"
            }`}
          >
            <div className={`flex size-10 items-center justify-center rounded-xl ${card.bg}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-ink">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Note filter + mode pills */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mr-1">
          Note
        </span>
        <button
          type="button"
          onClick={() => setNoteAndReset(null)}
          className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
            noteFilter === null
              ? "bg-ink text-white"
              : "border border-border text-muted-foreground hover:text-ink"
          }`}
        >
          Toutes
        </button>
        {STAR_FILTERS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setNoteAndReset(noteFilter === n ? null : n)}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
              noteFilter === n
                ? "bg-accent-yellow text-ink"
                : "border border-border text-muted-foreground hover:text-ink"
            }`}
          >
            <Star className="size-3 fill-current" />
            {n}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <Spinner className="mt-12" />
      ) : items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-2 text-center">
          <MessageSquare className="size-10 text-muted" />
          <p className="font-semibold text-ink">Aucun avis</p>
          <p className="text-sm text-muted-foreground">Aucun résultat pour ce filtre</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((avis) => (
            <ReviewCard
              key={avis.id}
              avis={avis}
              onMasquer={handleMasquer}
              onRestaurer={handleRestaurer}
              isLoading={masquer.isPending || restaurer.isPending}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} / {totalPages} — {total} avis
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-surface disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-surface disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
