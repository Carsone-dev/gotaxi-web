import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle, Clock, Wifi, WifiOff, AlertTriangle, Car,
  Search, X, ChevronLeft, ChevronRight, Star,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@gotaxi/ui";
import { useAdminChauffeurs, useAdminChauffeurStats } from "@/hooks/useAdmin";
import { formatDate, getInitials, formatCurrency, getMediaUrl, formatPhoneNumber } from "@/lib/format";
import type { AdminChauffeurItem } from "@/types/domain";

export default function ChauffeursPage() {
  const navigate = useNavigate();
  const [page, setPage]               = useState(1);
  const [kycFilter,   setKycFilter]   = useState<"tous" | "valide" | "attente">("tous");
  const [ligneFilter, setLigneFilter] = useState<"tous" | "en_ligne" | "hors_ligne">("tous");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");

  const params = {
    page,
    size: 25,
    ...(kycFilter   === "valide"      ? { kyc_valide: true }  : {}),
    ...(kycFilter   === "attente"     ? { kyc_valide: false } : {}),
    ...(ligneFilter === "en_ligne"    ? { en_ligne: true }    : {}),
    ...(ligneFilter === "hors_ligne"  ? { en_ligne: false }   : {}),
    ...(search ? { search } : {}),
  };

  const { data, isLoading }   = useAdminChauffeurs(params);
  const { data: stats }       = useAdminChauffeurStats();
  const chauffeurs             = data?.items ?? [];

  function resetPage() { setPage(1); }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    resetPage();
  }

  function clearSearch() { setSearchInput(""); setSearch(""); resetPage(); }

  const hasFilters = kycFilter !== "tous" || ligneFilter !== "tous" || !!search;

  function reset() {
    setKycFilter("tous"); setLigneFilter("tous");
    setSearchInput(""); setSearch(""); setPage(1);
  }

  // ─── Columns ──────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<AdminChauffeurItem, unknown>[]>(
    () => [
      {
        id: "chauffeur",
        header: "Chauffeur",
        cell: ({ row }) => {
          const u = row.original.user;
          if (!u) return <span className="text-xs text-muted-foreground">—</span>;
          return (
            <div className="flex items-center gap-3">
              {u.photo_url ? (
                <img src={getMediaUrl(u.photo_url) ?? ""} alt="" className="size-9 rounded-xl object-cover ring-2 ring-border" />
              ) : (
                <div className="flex size-9 items-center justify-center rounded-xl bg-surface text-xs font-bold ring-2 ring-border">
                  {getInitials(u.nom, u.prenom)}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold">{u.prenom} {u.nom}</p>
                <p className="text-xs text-muted-foreground">{formatPhoneNumber(u.telephone)}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: "kyc",
        header: "KYC",
        cell: ({ row }) => {
          const c = row.original;
          return c.kyc_valide
            ? <StatusBadge label="Validé" variant="success" dot />
            : <StatusBadge label="En attente" variant="warning" dot />;
        },
      },
      {
        id: "en_ligne",
        header: "Présence",
        cell: ({ row }) => {
          const c = row.original;
          return c.en_ligne
            ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
                <Wifi className="size-3.5" /> En ligne
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <WifiOff className="size-3.5" /> Hors ligne
              </span>
            );
        },
      },
      {
        id: "vehicule",
        header: "Véhicule",
        cell: ({ row }) => {
          const vv = row.original.vehicules;
          if (!vv || vv.length === 0) return <span className="text-xs text-muted-foreground">Aucun</span>;
          const v = vv[0];
          return (
            <div>
              <p className="text-sm font-medium">{v.marque} {v.modele}
                <span className="ml-1 text-xs text-muted-foreground">({v.annee})</span>
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-muted-foreground">{v.immatriculation} · {v.nombre_places} pl.</span>
                {v.climatise && (
                  <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-2xs font-medium text-blue-600">Clim</span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: "note",
        header: "Note",
        cell: ({ row }) => {
          const u = row.original.user;
          if (!u) return <span className="text-xs text-muted-foreground">—</span>;
          return (
            <span className="flex items-center gap-1 text-sm font-semibold">
              <Star className="size-3.5 fill-accent-yellow text-accent-yellow" />
              {u.note_moyenne.toFixed(1)}
              <span className="text-xs font-normal text-muted-foreground">({u.nombre_avis})</span>
            </span>
          );
        },
      },
      {
        id: "trajets",
        header: "Trajets",
        cell: ({ row }) => (
          <span className="text-sm font-semibold">{row.original.nombre_trajets}</span>
        ),
      },
      {
        id: "revenus",
        header: "Revenus",
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-success">
            {formatCurrency(row.original.revenus_total)}
          </span>
        ),
      },
      {
        id: "inscription",
        header: "Inscription",
        cell: ({ row }) => {
          const u = row.original.user;
          return (
            <span className="text-xs text-muted-foreground">
              {u ? formatDate(u.created_at) : "—"}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Chauffeurs"
        subtitle={`${data?.total ?? stats?.total ?? 0} chauffeurs enregistrés`}
        actions={
          (stats?.kyc_attente ?? 0) > 0 ? (
            <Link to="/chauffeurs/kyc-pending">
              <Button leftIcon={<AlertTriangle className="size-4" />}>
                {stats!.kyc_attente} KYC en attente
              </Button>
            </Link>
          ) : undefined
        }
      />

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total"
          value={stats?.total ?? 0}
          icon={<Car className="size-4" />}
          color="text-ink"
          active={kycFilter === "tous" && ligneFilter === "tous"}
          onClick={reset}
        />
        <StatCard
          label="En ligne"
          value={stats?.en_ligne ?? 0}
          icon={<Wifi className="size-4" />}
          color="text-success"
          active={ligneFilter === "en_ligne"}
          onClick={() => { setLigneFilter((v) => v === "en_ligne" ? "tous" : "en_ligne"); resetPage(); }}
        />
        <StatCard
          label="KYC validé"
          value={stats?.kyc_valide ?? 0}
          icon={<CheckCircle className="size-4" />}
          color="text-primary"
          active={kycFilter === "valide"}
          onClick={() => { setKycFilter((v) => v === "valide" ? "tous" : "valide"); resetPage(); }}
        />
        <StatCard
          label="KYC en attente"
          value={stats?.kyc_attente ?? 0}
          icon={<Clock className="size-4" />}
          color="text-warning-text"
          active={kycFilter === "attente"}
          onClick={() => { setKycFilter((v) => v === "attente" ? "tous" : "attente"); resetPage(); }}
        />
      </div>

      {/* ── Filtres ───────────────────────────────────────────────────────── */}
      <div className="mt-5 space-y-3">
        {/* Selects KYC + ligne */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={kycFilter}
            onChange={(e) => { setKycFilter(e.target.value as typeof kycFilter); resetPage(); }}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="tous">Tous les KYC</option>
            <option value="valide">KYC validé</option>
            <option value="attente">KYC en attente</option>
          </select>

          <select
            value={ligneFilter}
            onChange={(e) => { setLigneFilter(e.target.value as typeof ligneFilter); resetPage(); }}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="tous">Tous les statuts</option>
            <option value="en_ligne">En ligne</option>
            <option value="hors_ligne">Hors ligne</option>
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-muted-foreground hover:bg-surface transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Recherche */}
        <form onSubmit={submitSearch} className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Nom, prénom ou téléphone…"
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
          data={chauffeurs}
          columns={columns}
          onRowClick={(r) => navigate(`/chauffeurs/${r.user?.id ?? r.user_id}`)}
          loading={isLoading}
          emptyMessage="Aucun chauffeur pour ce filtre"
          pageSize={25}
        />
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {data && data.pages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Page {data.page} / {data.pages} — {data.total} chauffeurs
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
        onClick ? "cursor-pointer hover:shadow-sm" : "cursor-default",
        active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-white",
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
