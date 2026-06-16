import { useState, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, Search, X,
  TrendingUp, CheckCircle, Clock, XCircle, ArrowDownLeft, ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { OperatorCard } from "@/components/transactions/OperatorCard";
import { useAdminTransactions, useAdminTransactionsStats, useMoMoStats } from "@/hooks/useAdmin";
import { formatCurrency } from "@/lib/format";
import type { TransactionStatut, TransactionType, TransactionOperateur } from "@/types/domain";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUT_PILLS: { value: TransactionStatut | ""; label: string }[] = [
  { value: "",           label: "Tous"        },
  { value: "REUSSI",     label: "Réussi"      },
  { value: "EN_ATTENTE", label: "En attente"  },
  { value: "EN_COURS",   label: "En cours"    },
  { value: "ECHEC",      label: "Échoué"      },
  { value: "ANNULE",     label: "Annulé"      },
];

const TYPE_OPTIONS: { value: TransactionType | ""; label: string }[] = [
  { value: "",                  label: "Tous les types"    },
  { value: "FRAIS_RESERVATION", label: "Frais réservation" },
  { value: "FRAIS_COLIS",       label: "Frais colis"       },
  { value: "RECHARGE",          label: "Recharge"          },
  { value: "PAIEMENT_VOYAGE",   label: "Paiement voyage"   },
  { value: "PAIEMENT_COLIS",    label: "Paiement colis"    },
  { value: "REVERSEMENT",       label: "Reversement"       },
  { value: "REMBOURSEMENT",     label: "Remboursement"     },
  { value: "COMMISSION",        label: "Commission"        },
];

const OPERATEUR_OPTIONS: { value: TransactionOperateur | ""; label: string }[] = [
  { value: "",             label: "Tous les opérateurs" },
  { value: "FEDAPAY",      label: "FedaPay"             },
  { value: "MTN_MOMO",     label: "MTN MoMo"            },
  { value: "MOOV_MONEY",   label: "Moov Money"          },
  { value: "ORANGE_MONEY", label: "Orange Money"        },
  { value: "WALLET",       label: "Wallet interne"      },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const [page, setPage]         = useState(1);
  const [statut, setStatut]     = useState<TransactionStatut | "">("");
  const [type, setType]         = useState<TransactionType | "">("");
  const [operateur, setOperateur] = useState<TransactionOperateur | "">("");
  const [search, setSearch]     = useState("");
  const [searchInput, setSearchInput] = useState("");

  const params = {
    page,
    size: 25,
    ...(statut    ? { statut }    : {}),
    ...(type      ? { type }      : {}),
    ...(operateur ? { operateur } : {}),
    ...(search    ? { search }    : {}),
  };

  const { data, isLoading } = useAdminTransactions(params);
  const { data: stats }     = useAdminTransactionsStats({
    ...(type      ? { type }      : {}),
    ...(operateur ? { operateur } : {}),
  });
  const { data: momoStats } = useMoMoStats();

  const transactions = data?.items ?? [];

  // ── Stats computées ──────────────────────────────────────────────────────────
  const statsByStatut = useMemo(() => {
    const map: Record<string, { count: number; volume: number }> = {};
    for (const s of stats?.by_statut ?? []) map[s.statut] = s;
    return map;
  }, [stats]);

  const totalCount = useMemo(
    () => (stats?.by_statut ?? []).reduce((acc, s) => acc + s.count, 0),
    [stats],
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function reset() {
    setStatut(""); setType(""); setOperateur(""); setSearch(""); setSearchInput(""); setPage(1);
  }

  function setStatutAndReset(v: TransactionStatut | "") { setStatut(v); setPage(1); }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  function clearSearch() { setSearchInput(""); setSearch(""); setPage(1); }

  const hasFilters = !!(statut || type || operateur || search);

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle={`${data?.total ?? 0} résultat${(data?.total ?? 0) !== 1 ? "s" : ""}`}
      />

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total"
          value={totalCount}
          sub="toutes transactions"
          icon={<TrendingUp className="size-5 text-primary" />}
          bg="bg-primary/10"
          active={statut === ""}
          onClick={() => setStatutAndReset("")}
        />
        <StatCard
          label="Réussis"
          value={statsByStatut["REUSSI"]?.count ?? 0}
          sub={formatCurrency(stats?.volume_reussi ?? 0)}
          icon={<CheckCircle className="size-5 text-success" />}
          bg="bg-success-bg"
          active={statut === "REUSSI"}
          onClick={() => setStatutAndReset("REUSSI")}
        />
        <StatCard
          label="En attente"
          value={(statsByStatut["EN_ATTENTE"]?.count ?? 0) + (statsByStatut["EN_COURS"]?.count ?? 0)}
          sub="à traiter"
          icon={<Clock className="size-5 text-warning-text" />}
          bg="bg-warning-bg"
          active={statut === "EN_ATTENTE"}
          onClick={() => setStatutAndReset("EN_ATTENTE")}
        />
        <StatCard
          label="Échecs"
          value={(statsByStatut["ECHEC"]?.count ?? 0) + (statsByStatut["ANNULE"]?.count ?? 0)}
          sub="échoués + annulés"
          icon={<XCircle className="size-5 text-error" />}
          bg="bg-error-bg"
          active={statut === "ECHEC"}
          onClick={() => setStatutAndReset("ECHEC")}
        />
      </div>

      {/* ── Cartes opérateur ──────────────────────────────────────────────── */}
      {momoStats && momoStats.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {momoStats.map((stat) => (
            <OperatorCard key={stat.operateur} stat={stat} />
          ))}
        </div>
      )}

      {/* ── Filtres ───────────────────────────────────────────────────────── */}
      <div className="mt-5 space-y-3">
        {/* Statut pills */}
        <div className="flex flex-wrap items-center gap-2">
          {STATUT_PILLS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStatutAndReset(s.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                statut === s.value
                  ? "bg-ink text-white"
                  : "border border-border bg-white text-muted-foreground hover:text-ink"
              }`}
            >
              {s.label}
              {s.value !== "" && statsByStatut[s.value] != null && (
                <span className="ml-1.5 opacity-70">
                  {statsByStatut[s.value].count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Type + Opérateur + Recherche */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={type}
            onChange={(e) => { setType(e.target.value as TransactionType | ""); setPage(1); }}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <select
            value={operateur}
            onChange={(e) => { setOperateur(e.target.value as TransactionOperateur | ""); setPage(1); }}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {OPERATEUR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Recherche utilisateur */}
          <form onSubmit={submitSearch} className="relative flex-1 min-w-48">
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
          </form>

          {hasFilters && (
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-muted-foreground hover:bg-surface transition-colors whitespace-nowrap"
            >
              Réinitialiser
            </button>
          )}

          {data && (
            <span className="ml-auto text-sm text-muted-foreground whitespace-nowrap">
              {data.total} résultat{data.total !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── Tableau ───────────────────────────────────────────────────────── */}
      <div className="mt-4">
        <TransactionsTable transactions={transactions} loading={isLoading} />
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {data && data.pages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Page {data.page} / {data.pages} — {data.total} transactions
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
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-xs font-medium text-muted-foreground">{sub}</p>
      </div>
    </button>
  );
}
