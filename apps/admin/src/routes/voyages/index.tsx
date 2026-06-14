import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Navigation, PlayCircle, CheckCircle, XCircle, Clock,
  Plus, Search, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@gotaxi/ui";
import { useAdminVoyages, useAdminVoyagesStats } from "@/hooks/useAdmin";
import { formatDateTime, formatCurrency } from "@/lib/format";
import { CreateVoyageWizard } from "./CreateVoyageWizard";
import type { VoyageRead, VoyageStatut } from "@/types/domain";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUT_CONFIG: Record<VoyageStatut, { label: string; variant: "success" | "info" | "warning" | "error" | "neutral" }> = {
  PUBLIE:   { label: "Publié",   variant: "info"    },
  COMPLET:  { label: "Complet",  variant: "warning" },
  EN_COURS: { label: "En cours", variant: "success" },
  TERMINE:  { label: "Terminé",  variant: "neutral" },
  ANNULE:   { label: "Annulé",   variant: "error"   },
};

const STATUT_PILLS: { value: VoyageStatut | ""; label: string }[] = [
  { value: "",         label: "Tous"      },
  { value: "PUBLIE",   label: "Publiés"   },
  { value: "COMPLET",  label: "Complets"  },
  { value: "EN_COURS", label: "En cours"  },
  { value: "TERMINE",  label: "Terminés"  },
  { value: "ANNULE",   label: "Annulés"   },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VoyagesPage() {
  const navigate = useNavigate();
  const [page, setPage]               = useState(1);
  const [statut, setStatut]           = useState<VoyageStatut | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [showWizard, setShowWizard]   = useState(false);

  const params = {
    page,
    size: 25,
    ...(statut ? { statut } : {}),
    ...(search ? { search } : {}),
  };

  const { data, isLoading }   = useAdminVoyages(params);
  const { data: stats }       = useAdminVoyagesStats();
  const voyages                = data?.items ?? [];

  const statsByStatut = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of stats?.by_statut ?? []) map[s.statut] = s.count;
    return map;
  }, [stats]);

  const totalVoyages = useMemo(
    () => (stats?.by_statut ?? []).reduce((acc, s) => acc + s.count, 0),
    [stats],
  );

  function setStatutAndReset(v: VoyageStatut | "") { setStatut(v); setPage(1); }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  function clearSearch() { setSearchInput(""); setSearch(""); setPage(1); }

  // ─── Columns ────────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<VoyageRead, unknown>[]>(
    () => [
      {
        id: "trajet",
        header: "Trajet",
        cell: ({ row }) => {
          const v = row.original;
          return (
            <div>
              <p className="text-sm font-bold">{v.ville_depart} → {v.ville_arrivee}</p>
              <p className="truncate max-w-[180px] text-xs text-muted-foreground">{v.point_depart}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "date_depart",
        header: "Départ",
        cell: ({ getValue }) => (
          <span className="text-sm whitespace-nowrap">{formatDateTime(getValue() as string)}</span>
        ),
      },
      {
        id: "remplissage",
        header: "Remplissage",
        cell: ({ row }) => {
          const v = row.original;
          const vendues = v.nombre_places_total - v.nombre_places_restantes;
          const pct = v.nombre_places_total > 0
            ? Math.round((vendues / v.nombre_places_total) * 100)
            : 0;
          const barColor =
            pct >= 100 ? "bg-error" :
            pct >= 75  ? "bg-success" :
            pct >= 40  ? "bg-warning-text" : "bg-primary/40";
          return (
            <div className="min-w-[90px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-ink">{vendues}/{v.nombre_places_total}</span>
                <span className="text-xs text-muted-foreground">{pct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "prix_par_place",
        header: "Prix/place",
        cell: ({ getValue }) => (
          <span className="text-sm font-semibold whitespace-nowrap">
            {formatCurrency(getValue() as number)}
          </span>
        ),
      },
      {
        id: "revenu",
        header: "Revenu estimé",
        cell: ({ row }) => {
          const v = row.original;
          const vendues = v.nombre_places_total - v.nombre_places_restantes;
          const revenu = vendues * v.prix_par_place;
          return (
            <span className={`text-sm font-bold ${revenu > 0 ? "text-success" : "text-muted-foreground"}`}>
              {revenu > 0 ? formatCurrency(revenu) : "—"}
            </span>
          );
        },
      },
      {
        id: "options",
        header: "Options",
        cell: ({ row }) => {
          const v = row.original;
          return (
            <div className="flex gap-1 flex-wrap">
              {v.climatise    && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">Clim</span>}
              {v.accepte_colis && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">Colis</span>}
              {v.non_fumeur   && <span className="rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500">🚭</span>}
            </div>
          );
        },
      },
      {
        accessorKey: "statut",
        header: "Statut",
        cell: ({ getValue }) => {
          const s = getValue() as VoyageStatut;
          const conf = STATUT_CONFIG[s] ?? { label: s, variant: "neutral" as const };
          return <StatusBadge label={conf.label} variant={conf.variant} dot />;
        },
      },
    ],
    [],
  );

  return (
    <>
      {showWizard && <CreateVoyageWizard onClose={() => setShowWizard(false)} />}

      <PageHeader
        title="Voyages"
        subtitle={`${data?.total ?? totalVoyages} voyages au total`}
        actions={
          <Button leftIcon={<Plus className="size-4" />} onClick={() => setShowWizard(true)}>
            Nouveau trajet
          </Button>
        }
      />

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard
          label="Total"
          value={totalVoyages}
          icon={<Navigation className="size-4" />}
          color="text-ink"
          active={statut === ""}
          onClick={() => setStatutAndReset("")}
        />
        <StatCard
          label="Publiés"
          value={(statsByStatut["PUBLIE"] ?? 0) + (statsByStatut["COMPLET"] ?? 0)}
          icon={<Clock className="size-4" />}
          color="text-primary"
          active={statut === "PUBLIE"}
          onClick={() => setStatutAndReset(statut === "PUBLIE" ? "" : "PUBLIE")}
        />
        <StatCard
          label="En cours"
          value={statsByStatut["EN_COURS"] ?? 0}
          icon={<PlayCircle className="size-4" />}
          color="text-success"
          active={statut === "EN_COURS"}
          onClick={() => setStatutAndReset(statut === "EN_COURS" ? "" : "EN_COURS")}
        />
        <StatCard
          label="Terminés"
          value={statsByStatut["TERMINE"] ?? 0}
          icon={<CheckCircle className="size-4" />}
          color="text-muted-foreground"
          active={statut === "TERMINE"}
          onClick={() => setStatutAndReset(statut === "TERMINE" ? "" : "TERMINE")}
        />
        <StatCard
          label="Annulés"
          value={statsByStatut["ANNULE"] ?? 0}
          icon={<XCircle className="size-4" />}
          color="text-error"
          active={statut === "ANNULE"}
          onClick={() => setStatutAndReset(statut === "ANNULE" ? "" : "ANNULE")}
        />
      </div>

      {/* ── Filtres ───────────────────────────────────────────────────────── */}
      <div className="mt-5 space-y-3">
        {/* Statut pills */}
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
                <span className="ml-1.5 opacity-70">{statsByStatut[value]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Recherche par ville */}
        <form onSubmit={submitSearch} className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Ville départ ou arrivée…"
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
          data={voyages}
          columns={columns}
          onRowClick={(v) => navigate(`/voyages/${v.id}`)}
          loading={isLoading}
          emptyMessage="Aucun voyage pour ce filtre"
          pageSize={25}
        />
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {data && data.pages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Page {data.page} / {data.pages} — {data.total} voyages
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
    </>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon, color, active, onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border p-4 text-left transition-all w-full",
        active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-white hover:shadow-sm",
      ].join(" ")}
    >
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-extrabold text-ink">{value.toLocaleString("fr-FR")}</p>
    </button>
  );
}
