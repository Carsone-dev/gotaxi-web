import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Users, CheckCircle, XCircle, Clock, Search, X,
  ChevronLeft, ChevronRight, Star, Car,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { useAdminUsers, useAdminUsersStats } from "@/hooks/useAdmin";
import { formatDate, formatPhoneNumber, getInitials, getMediaUrl } from "@/lib/format";
import type { UserRead, UserStatut, UserRole } from "@/types/domain";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUT_PILLS: { value: UserStatut | ""; label: string }[] = [
  { value: "",               label: "Tous"          },
  { value: "ACTIF",          label: "Actifs"        },
  { value: "SUSPENDU",       label: "Suspendus"     },
  { value: "EN_ATTENTE_KYC", label: "KYC en attente"},
  { value: "SUPPRIME",       label: "Supprimés"     },
];

const ROLE_OPTIONS: { value: UserRole | ""; label: string }[] = [
  { value: "",            label: "Tous les rôles" },
  { value: "CLIENT",      label: "Clients"        },
  { value: "CHAUFFEUR",   label: "Chauffeurs"     },
  { value: "ADMIN",       label: "Admins"         },
  { value: "SUPER_ADMIN", label: "Super Admins"   },
];

const ROLE_LABELS: Record<UserRole, string> = {
  CLIENT:      "Client",
  CHAUFFEUR:   "Chauffeur",
  ADMIN:       "Admin",
  SUPER_ADMIN: "Super Admin",
};

const ROLE_COLORS: Record<UserRole, string> = {
  CLIENT:      "bg-surface text-muted-foreground",
  CHAUFFEUR:   "bg-primary/10 text-primary",
  ADMIN:       "bg-purple-50 text-purple-700",
  SUPER_ADMIN: "bg-yellow-50 text-yellow-700",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const navigate = useNavigate();
  const [page, setPage]               = useState(1);
  const [statut, setStatut]           = useState<UserStatut | "">("");
  const [role, setRole]               = useState<UserRole | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");

  const params = {
    page,
    size: 25,
    ...(statut ? { statut } : {}),
    ...(role   ? { role }   : {}),
    ...(search ? { search } : {}),
  };

  const { data, isLoading } = useAdminUsers(params);
  const { data: stats }     = useAdminUsersStats();
  const users                = data?.items ?? [];

  const statsByStatut = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of stats?.by_statut ?? []) map[s.statut] = s.count;
    return map;
  }, [stats]);

  const totalCount = useMemo(
    () => (stats?.by_statut ?? []).reduce((acc, s) => acc + s.count, 0),
    [stats],
  );

  function setStatutAndReset(v: UserStatut | "") { setStatut(v); setPage(1); }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  function clearSearch() { setSearchInput(""); setSearch(""); setPage(1); }

  // ─── Columns ──────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<UserRead, unknown>[]>(
    () => [
      {
        id: "utilisateur",
        header: "Utilisateur",
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center gap-3">
              {u.photo_url ? (
                <img src={getMediaUrl(u.photo_url) ?? ""} alt="" className="size-9 rounded-xl object-cover ring-2 ring-border" />
              ) : (
                <div className="flex size-9 items-center justify-center rounded-xl bg-surface text-xs font-bold text-muted-foreground ring-2 ring-border">
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
        accessorKey: "role",
        header: "Rôle",
        cell: ({ getValue }) => {
          const r = getValue() as UserRole;
          return (
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_COLORS[r] ?? "bg-surface text-muted-foreground"}`}>
              {ROLE_LABELS[r] ?? r}
            </span>
          );
        },
      },
      {
        accessorKey: "statut",
        header: "Statut",
        cell: ({ getValue }) => <UserStatusBadge statut={getValue() as UserStatut} />,
      },
      {
        accessorKey: "note_moyenne",
        header: "Note",
        cell: ({ getValue, row }) => {
          const note = getValue() as number;
          return (
            <span className="flex items-center gap-1 text-sm">
              <Star className="size-3.5 fill-accent-yellow text-accent-yellow" />
              <span className="font-semibold">{note.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({row.original.nombre_avis})</span>
            </span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Inscription",
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(getValue() as string)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        subtitle={`${data?.total ?? totalCount} utilisateurs au total`}
      />

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total"
          value={totalCount}
          sub="tous rôles"
          icon={<Users className="size-5 text-primary" />}
          bg="bg-primary/10"
          active={statut === ""}
          onClick={() => setStatutAndReset("")}
        />
        <StatCard
          label="Actifs"
          value={statsByStatut["ACTIF"] ?? 0}
          sub="comptes actifs"
          icon={<CheckCircle className="size-5 text-success" />}
          bg="bg-success-bg"
          active={statut === "ACTIF"}
          onClick={() => setStatutAndReset(statut === "ACTIF" ? "" : "ACTIF")}
        />
        <StatCard
          label="Suspendus"
          value={statsByStatut["SUSPENDU"] ?? 0}
          sub="accès bloqué"
          icon={<XCircle className="size-5 text-error" />}
          bg="bg-error-bg"
          active={statut === "SUSPENDU"}
          onClick={() => setStatutAndReset(statut === "SUSPENDU" ? "" : "SUSPENDU")}
        />
        <StatCard
          label="KYC en attente"
          value={statsByStatut["EN_ATTENTE_KYC"] ?? 0}
          sub="à valider"
          icon={<Clock className="size-5 text-warning-text" />}
          bg="bg-warning-bg"
          active={statut === "EN_ATTENTE_KYC"}
          onClick={() => setStatutAndReset(statut === "EN_ATTENTE_KYC" ? "" : "EN_ATTENTE_KYC")}
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

        {/* Rôle + Recherche */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value as UserRole | ""); setPage(1); }}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <form onSubmit={submitSearch} className="flex flex-1 items-center gap-2">
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
          </form>

          {data && (
            <span className="ml-auto text-sm text-muted-foreground whitespace-nowrap">
              {data.total} résultat{data.total !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Compteurs par rôle */}
        {stats && (
          <div className="flex flex-wrap gap-2">
            {stats.by_role.map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => { setRole((v) => v === r.role ? "" : r.role as UserRole); setPage(1); }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors border ${
                  role === r.role
                    ? "border-ink bg-ink text-white"
                    : `border-border ${ROLE_COLORS[r.role as UserRole] ?? "bg-surface text-muted-foreground"}`
                }`}
              >
                {r.role === "CHAUFFEUR" && <Car className="size-3" />}
                {ROLE_LABELS[r.role as UserRole] ?? r.role}
                <span className="opacity-70">{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Tableau ───────────────────────────────────────────────────────── */}
      <div className="mt-4">
        <DataTable
          data={users}
          columns={columns}
          onRowClick={(u) => navigate(`/users/${u.id}`)}
          loading={isLoading}
          emptyMessage="Aucun utilisateur pour ce filtre"
          pageSize={25}
        />
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {data && data.pages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Page {data.page} / {data.pages} — {data.total} utilisateurs
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
