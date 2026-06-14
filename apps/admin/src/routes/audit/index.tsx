import { useMemo, useState } from "react";
import {
  ClipboardList, CalendarDays, Users2, Search, X,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuditLogs, useAuditStats } from "@/hooks/useAdmin";
import { formatDateTime } from "@/lib/format";
import type { AuditLog } from "@/lib/api/admin";

// ─── Config ───────────────────────────────────────────────────────────────────

const ACTION_COLOR: Record<string, string> = {
  SUSPEND_USER:          "bg-error/10 text-error",
  ACTIVATE_USER:         "bg-success-bg text-success",
  VALIDATE_KYC:          "bg-success-bg text-success",
  REJECT_KYC:            "bg-error/10 text-error",
  CONVERT_TO_CHAUFFEUR:  "bg-primary/10 text-primary",
  ADMIN_CREATE_VOYAGE:   "bg-primary/10 text-primary",
  CANCEL_VOYAGE:         "bg-error/10 text-error",
  CANCEL_RESERVATION:    "bg-error/10 text-error",
  VALIDATE_COLIS:        "bg-success-bg text-success",
  REJECT_COLIS:          "bg-error/10 text-error",
  MASQUER_AVIS:          "bg-warning-bg text-warning-text",
  RESTAURER_AVIS:        "bg-success-bg text-success",
  CREATE_VILLE:          "bg-purple-50 text-purple-700",
  UPDATE_VILLE:          "bg-purple-50 text-purple-700",
  DELETE_VILLE:          "bg-error/10 text-error",
  CREATE_GARE:           "bg-purple-50 text-purple-700",
  UPDATE_GARE:           "bg-purple-50 text-purple-700",
  DELETE_GARE:           "bg-error/10 text-error",
};

const ACTION_LABELS: Record<string, string> = {
  SUSPEND_USER:          "Suspension",
  ACTIVATE_USER:         "Réactivation",
  VALIDATE_KYC:          "KYC validé",
  REJECT_KYC:            "KYC refusé",
  CONVERT_TO_CHAUFFEUR:  "→ Chauffeur",
  ADMIN_CREATE_VOYAGE:   "Voyage créé",
  CANCEL_VOYAGE:         "Voyage annulé",
  CANCEL_RESERVATION:    "Résa annulée",
  VALIDATE_COLIS:        "Colis validé",
  REJECT_COLIS:          "Colis refusé",
  MASQUER_AVIS:          "Avis masqué",
  RESTAURER_AVIS:        "Avis restauré",
  CREATE_VILLE:          "Ville créée",
  UPDATE_VILLE:          "Ville modifiée",
  DELETE_VILLE:          "Ville supprimée",
  CREATE_GARE:           "Gare créée",
  UPDATE_GARE:           "Gare modifiée",
  DELETE_GARE:           "Gare supprimée",
};

const ENTITE_PILLS = [
  { value: "",             label: "Tous" },
  { value: "users",        label: "Utilisateurs" },
  { value: "chauffeurs",   label: "Chauffeurs" },
  { value: "voyages",      label: "Voyages" },
  { value: "reservations", label: "Réservations" },
  { value: "colis",        label: "Colis" },
  { value: "avis",         label: "Avis" },
  { value: "ville",        label: "Villes" },
  { value: "gare",         label: "Gares" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuditPage() {
  const [page, setPage]               = useState(1);
  const [entite, setEntite]           = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [action, setAction]           = useState("");
  const [expanded, setExpanded]       = useState<string | null>(null);

  const params = {
    page,
    size: 50,
    ...(action ? { action } : {}),
    ...(entite ? { entite } : {}),
  };

  const { data, isLoading } = useAuditLogs(params);
  const { data: stats }     = useAuditStats();
  const logs                = data?.items ?? [];

  function setEntiteAndReset(v: string) { setEntite(v); setPage(1); }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setAction(searchInput.trim());
    setPage(1);
  }

  function clearSearch() { setSearchInput(""); setAction(""); setPage(1); }

  return (
    <>
      <PageHeader
        title="Logs d'audit"
        subtitle={`${data?.total ?? stats?.total ?? 0} événements enregistrés`}
      />

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <StatCard
          label="Total"
          value={stats?.total ?? 0}
          sub="tous les logs"
          icon={<ClipboardList className="size-5 text-primary" />}
          bg="bg-primary/10"
        />
        <StatCard
          label="Aujourd'hui"
          value={stats?.today ?? 0}
          sub="depuis minuit"
          icon={<CalendarDays className="size-5 text-success" />}
          bg="bg-success-bg"
        />
        <StatCard
          label="Admins actifs"
          value={stats?.unique_admins ?? 0}
          sub="ayant agi"
          icon={<Users2 className="size-5 text-warning-text" />}
          bg="bg-warning-bg"
        />
      </div>

      {/* ── Filtres ───────────────────────────────────────────────────────── */}
      <div className="mt-5 space-y-3">
        {/* Pills entité */}
        <div className="flex flex-wrap gap-2">
          {ENTITE_PILLS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setEntiteAndReset(value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                entite === value
                  ? "bg-ink text-white"
                  : "border border-border bg-white text-muted-foreground hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Recherche par action */}
        <div className="flex items-center gap-2">
          <form onSubmit={submitSearch} className="flex flex-1 items-center gap-2 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filtrer par action (ex: KYC, VOYAGE…)"
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
              Filtrer
            </button>
          </form>

          {/* Top actions from stats */}
          {stats && stats.by_action.length > 0 && (
            <div className="hidden items-center gap-1.5 lg:flex">
              {stats.by_action.slice(0, 5).map((a) => (
                <button
                  key={a.action}
                  type="button"
                  onClick={() => {
                    const v = action === a.action ? "" : a.action;
                    setSearchInput(v);
                    setAction(v);
                    setPage(1);
                  }}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                    action === a.action
                      ? "bg-ink text-white"
                      : `border border-border ${ACTION_COLOR[a.action] ?? "bg-surface text-muted-foreground"}`
                  }`}
                >
                  {ACTION_LABELS[a.action] ?? a.action}
                  <span className="ml-1 opacity-70">{a.count}</span>
                </button>
              ))}
            </div>
          )}

          {data && (
            <span className="ml-auto text-sm text-muted-foreground whitespace-nowrap">
              {data.total} résultat{data.total !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-muted-foreground text-sm">
            Chargement…
          </div>
        ) : !logs.length ? (
          <div className="flex items-center justify-center p-12 text-muted-foreground text-sm">
            Aucun log pour ce filtre
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Header */}
            <div className="grid grid-cols-[1fr_160px_180px_140px_32px] items-center gap-4 bg-surface px-5 py-3 text-xs font-semibold text-muted-foreground">
              <span>Action</span>
              <span>Admin</span>
              <span>Cible</span>
              <span>Date</span>
              <span />
            </div>

            {logs.map((log) => (
              <LogRow
                key={log.id}
                log={log}
                expanded={expanded === log.id}
                onToggle={() => setExpanded((prev) => (prev === log.id ? null : log.id))}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {data && data.pages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Page {data.page} / {data.pages} — {data.total} logs
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

// ─── LogRow ───────────────────────────────────────────────────────────────────

function LogRow({ log, expanded, onToggle }: { log: AuditLog; expanded: boolean; onToggle: () => void }) {
  const hasDetails = log.details && Object.keys(log.details).length > 0;
  const colorClass = ACTION_COLOR[log.action] ?? "bg-surface text-muted-foreground";
  const label      = ACTION_LABELS[log.action] ?? log.action;

  return (
    <>
      <div
        className={`grid grid-cols-[1fr_160px_180px_140px_32px] items-center gap-4 px-5 py-3.5 transition-colors ${
          hasDetails ? "cursor-pointer hover:bg-surface" : ""
        }`}
        onClick={hasDetails ? onToggle : undefined}
      >
        {/* Action */}
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className={`self-start rounded-full px-2.5 py-0.5 text-xs font-bold ${colorClass}`}>
            {label}
          </span>
          <span className="font-mono text-2xs text-muted-foreground">{log.action}</span>
        </div>

        {/* Admin */}
        <div className="min-w-0">
          {log.admin_prenom || log.admin_nom ? (
            <p className="truncate text-sm font-semibold">
              {log.admin_prenom} {log.admin_nom}
            </p>
          ) : (
            <p className="font-mono text-xs text-muted-foreground">
              {log.admin_id.slice(0, 8)}…
            </p>
          )}
        </div>

        {/* Cible */}
        <div className="min-w-0">
          <p className="text-xs font-semibold capitalize">{log.target_type ?? "—"}</p>
          {log.target_id && (
            <p className="font-mono text-2xs text-muted-foreground">
              {log.target_id.length > 8 ? `${log.target_id.slice(0, 8)}…` : log.target_id}
            </p>
          )}
        </div>

        {/* Date */}
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDateTime(log.created_at)}
        </span>

        {/* Expand toggle */}
        <div className="flex items-center justify-center">
          {hasDetails ? (
            expanded
              ? <ChevronUp className="size-4 text-muted-foreground" />
              : <ChevronDown className="size-4 text-muted-foreground" />
          ) : null}
        </div>
      </div>

      {/* Details row */}
      {expanded && hasDetails && (
        <div className="bg-surface px-5 py-3">
          <pre className="overflow-x-auto rounded-xl border border-border bg-white p-3 font-mono text-xs text-ink">
            {JSON.stringify(log.details, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon, bg,
}: {
  label: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  bg: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-ink">{value.toLocaleString("fr-FR")}</p>
        <p className="truncate text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}
