import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Clock, CheckCircle, XCircle, Ban, Star, Search, X,
  ChevronLeft, ChevronRight, Copy, Check,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAdminReservations, useAdminReservationsStats, useCancelReservation } from "@/hooks/useAdmin";
import { formatDateTime, formatCurrency, getInitials, getMediaUrl } from "@/lib/format";
import { toast } from "sonner";
import { Button } from "@gotaxi/ui";
import type { ReservationRead, ReservationStatut } from "@/types/domain";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUT_CONFIG: Record<ReservationStatut, { label: string; variant: "success" | "info" | "warning" | "error" | "neutral" }> = {
  EN_ATTENTE: { label: "En attente", variant: "warning" },
  CONFIRMEE:  { label: "Confirmée",  variant: "success" },
  REFUSEE:    { label: "Refusée",    variant: "error"   },
  ANNULEE:    { label: "Annulée",    variant: "neutral" },
  TERMINEE:   { label: "Terminée",   variant: "info"    },
};

const STATUT_PILLS: { value: ReservationStatut | ""; label: string }[] = [
  { value: "",           label: "Toutes"      },
  { value: "EN_ATTENTE", label: "En attente"  },
  { value: "CONFIRMEE",  label: "Confirmées"  },
  { value: "TERMINEE",   label: "Terminées"   },
  { value: "ANNULEE",    label: "Annulées"    },
  { value: "REFUSEE",    label: "Refusées"    },
];

const CANCELLABLE: ReservationStatut[] = ["EN_ATTENTE", "CONFIRMEE"];

// ─── CopyCode ─────────────────────────────────────────────────────────────────

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="flex items-center gap-1.5 group">
      <span className="font-mono text-xs font-bold text-primary">{code}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
        title="Copier le code"
      >
        {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReservationsPage() {
  const navigate = useNavigate();
  const [page, setPage]               = useState(1);
  const [statut, setStatut]           = useState<ReservationStatut | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [cancelTarget, setCancelTarget] = useState<{ id: string; code: string } | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const params = {
    page,
    size: 25,
    ...(statut ? { statut } : {}),
    ...(search ? { search } : {}),
  };

  const { data, isLoading }   = useAdminReservations(params);
  const { data: stats }       = useAdminReservationsStats();
  const reservations           = data?.items ?? [];
  const cancelMutation         = useCancelReservation();

  const statsByStatut = useMemo(() => {
    const map: Record<string, { count: number; volume: number }> = {};
    for (const s of stats?.by_statut ?? []) map[s.statut] = s;
    return map;
  }, [stats]);

  const totalCount = useMemo(
    () => (stats?.by_statut ?? []).reduce((acc, s) => acc + s.count, 0),
    [stats],
  );

  function setStatutAndReset(v: ReservationStatut | "") { setStatut(v); setPage(1); }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  function clearSearch() { setSearchInput(""); setSearch(""); setPage(1); }

  const handleCancel = async () => {
    if (!cancelTarget || !cancelReason.trim()) return;
    try {
      await cancelMutation.mutateAsync({ reservationId: cancelTarget.id, reason: cancelReason });
      toast.success(`Réservation ${cancelTarget.code} annulée`);
      setCancelTarget(null);
      setCancelReason("");
    } catch {
      toast.error("Erreur lors de l'annulation");
    }
  };

  // ─── Columns ──────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<ReservationRead, unknown>[]>(
    () => [
      {
        accessorKey: "code_confirmation",
        header: "Code",
        cell: ({ getValue }) => <CopyCode code={getValue() as string} />,
      },
      {
        id: "client",
        header: "Client",
        cell: ({ row }) => {
          const c = row.original.client;
          if (!c) return <span className="text-xs text-muted-foreground">—</span>;
          return (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navigate(`/users/${c.id}`); }}
              className="flex items-center gap-2.5 text-left group"
            >
              {c.photo_url ? (
                <img src={getMediaUrl(c.photo_url) ?? ""} alt="" className="size-7 rounded-lg object-cover" />
              ) : (
                <div className="flex size-7 items-center justify-center rounded-lg bg-surface text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {getInitials(c.nom, c.prenom)}
                </div>
              )}
              <div>
                <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                  {c.prenom} {c.nom}
                </p>
                <p className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Star className="size-2.5" />{c.note_moyenne.toFixed(1)}
                </p>
              </div>
            </button>
          );
        },
      },
      {
        id: "trajet",
        header: "Trajet",
        cell: ({ row }) => {
          const v = row.original.voyage;
          if (!v) return <span className="text-xs text-muted-foreground">—</span>;
          return (
            <div>
              <p className="text-sm font-semibold">{v.ville_depart} → {v.ville_arrivee}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(v.date_depart)}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "nombre_places",
        header: "Places",
        cell: ({ getValue }) => (
          <span className="text-sm font-semibold">{getValue() as number} pl.</span>
        ),
      },
      {
        accessorKey: "prix_total",
        header: "Montant",
        cell: ({ getValue }) => (
          <span className="text-sm font-bold text-ink">{formatCurrency(getValue() as number)}</span>
        ),
      },
      {
        accessorKey: "statut",
        header: "Statut",
        cell: ({ getValue }) => {
          const s = getValue() as ReservationStatut;
          const conf = STATUT_CONFIG[s] ?? { label: s, variant: "neutral" as const };
          return <StatusBadge label={conf.label} variant={conf.variant} dot />;
        },
      },
      {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDateTime(getValue() as string)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const r = row.original;
          if (!CANCELLABLE.includes(r.statut)) return null;
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCancelTarget({ id: r.id, code: r.code_confirmation });
              }}
              className="flex items-center gap-1 rounded-lg border border-error/30 px-2.5 py-1 text-xs font-semibold text-error transition-colors hover:bg-error/5"
            >
              <X className="size-3" />
              Annuler
            </button>
          );
        },
      },
    ],
    [navigate],
  );

  return (
    <>
      <PageHeader
        title="Réservations"
        subtitle={`${data?.total ?? totalCount} réservation${(data?.total ?? totalCount) !== 1 ? "s" : ""} au total`}
      />

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total"
          value={totalCount}
          sub="toutes"
          icon={<Star className="size-5 text-primary" />}
          bg="bg-primary/10"
          active={statut === ""}
          onClick={() => setStatutAndReset("")}
        />
        <StatCard
          label="En attente"
          value={statsByStatut["EN_ATTENTE"]?.count ?? 0}
          sub="à confirmer"
          icon={<Clock className="size-5 text-warning-text" />}
          bg="bg-warning-bg"
          active={statut === "EN_ATTENTE"}
          onClick={() => setStatutAndReset(statut === "EN_ATTENTE" ? "" : "EN_ATTENTE")}
        />
        <StatCard
          label="Confirmées"
          value={(statsByStatut["CONFIRMEE"]?.count ?? 0) + (statsByStatut["TERMINEE"]?.count ?? 0)}
          sub={formatCurrency(stats?.volume_confirmees ?? 0)}
          icon={<CheckCircle className="size-5 text-success" />}
          bg="bg-success-bg"
          active={statut === "CONFIRMEE"}
          onClick={() => setStatutAndReset(statut === "CONFIRMEE" ? "" : "CONFIRMEE")}
        />
        <StatCard
          label="Annulées"
          value={(statsByStatut["ANNULEE"]?.count ?? 0) + (statsByStatut["REFUSEE"]?.count ?? 0)}
          sub="annulées + refusées"
          icon={<Ban className="size-5 text-error" />}
          bg="bg-error-bg"
          active={statut === "ANNULEE"}
          onClick={() => setStatutAndReset(statut === "ANNULEE" ? "" : "ANNULEE")}
        />
      </div>

      {/* ── Filtres ───────────────────────────────────────────────────────── */}
      <div className="mt-5 space-y-3">
        {/* Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {STATUT_PILLS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatutAndReset(value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                statut === value
                  ? "bg-ink text-white"
                  : "border border-border bg-white text-muted-foreground hover:text-ink"
              }`}
            >
              {label}
              {value !== "" && statsByStatut[value] != null && (
                <span className="ml-1.5 opacity-70">{statsByStatut[value].count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Recherche */}
        <form onSubmit={submitSearch} className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Code, nom ou téléphone client…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Rechercher
          </button>
          {data && (
            <span className="ml-auto text-sm text-muted-foreground whitespace-nowrap">
              {data.total} résultat{data.total !== 1 ? "s" : ""}
            </span>
          )}
        </form>
      </div>

      {/* ── Tableau ───────────────────────────────────────────────────────── */}
      <div className="mt-4">
        <DataTable
          data={reservations}
          columns={columns}
          onRowClick={(r) => navigate(`/reservations/${r.id}`)}
          loading={isLoading}
          emptyMessage="Aucune réservation pour ce filtre"
          pageSize={25}
        />
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {data && data.pages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Page {data.page} / {data.pages} — {data.total} réservations
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-surface disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              disabled={page >= data.pages}
              onClick={() => setPage((p) => p + 1)}
              className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-surface disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Modal annulation ──────────────────────────────────────────────── */}
      {cancelTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => { setCancelTarget(null); setCancelReason(""); }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-1 text-base font-bold">Annuler la réservation</h3>
            <p className="mb-4 font-mono text-sm text-primary">{cancelTarget.code}</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Motif d'annulation (requis)…"
              rows={3}
              className="w-full resize-none rounded-xl border border-border px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
            {cancelMutation.isError && (
              <p className="mt-2 text-xs text-error">Une erreur est survenue. Réessayez.</p>
            )}
            <div className="mt-4 flex gap-3">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancel}
                disabled={!cancelReason.trim()}
                loading={cancelMutation.isPending}
              >
                Confirmer l'annulation
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setCancelTarget(null); setCancelReason(""); }}
              >
                Retour
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon, bg, active, onClick,
}: {
  label: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  bg: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
        active
          ? "border-primary/30 ring-2 ring-primary/20 bg-white shadow-soft"
          : "border-border bg-white hover:shadow-soft"
      }`}
    >
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-ink">{value.toLocaleString("fr-FR")}</p>
        <p className="truncate text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{sub}</p>
      </div>
    </button>
  );
}
