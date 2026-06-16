import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime, formatCurrency, formatPhoneNumber, getInitials } from "@/lib/format";
import type { TransactionRead, TransactionStatut, TransactionOperateur, TransactionType } from "@/types/domain";

export const STATUT_CONFIG: Record<TransactionStatut, { label: string; variant: "success" | "error" | "warning" | "neutral" | "info" }> = {
  REUSSI:     { label: "Réussi",     variant: "success" },
  EN_ATTENTE: { label: "En attente", variant: "warning" },
  EN_COURS:   { label: "En cours",   variant: "info"    },
  ECHEC:      { label: "Échoué",     variant: "error"   },
  ANNULE:     { label: "Annulé",     variant: "neutral" },
};

export const TYPE_LABELS: Record<TransactionType, string> = {
  FRAIS_RESERVATION: "Frais réservation",
  FRAIS_COLIS:        "Frais colis",
  RECHARGE:        "Recharge",
  PAIEMENT_VOYAGE: "Paiement voyage",
  PAIEMENT_COLIS:  "Paiement colis",
  REVERSEMENT:     "Reversement",
  REMBOURSEMENT:   "Remboursement",
  COMMISSION:      "Commission",
};

// Types where montant is "positive" for the user/chauffeur (credit)
const CREDIT_TYPES = new Set<TransactionType>(["RECHARGE", "REVERSEMENT", "REMBOURSEMENT"]);

export const OPERATOR_CONFIG: Record<TransactionOperateur, { label: string; dot: string }> = {
  FEDAPAY:     { label: "FedaPay",      dot: "bg-emerald-500" },
  MTN_MOMO:    { label: "MTN MoMo",     dot: "bg-yellow-400" },
  MOOV_MONEY:  { label: "Moov Money",   dot: "bg-sky-400"    },
  ORANGE_MONEY:{ label: "Orange Money", dot: "bg-orange-400" },
  CELTIS:      { label: "Celtis",       dot: "bg-purple-400" },
  WALLET:      { label: "Wallet",       dot: "bg-primary"    },
};

function CopyRef({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="flex items-center gap-1.5 group">
      <span className="font-mono text-xs text-muted-foreground truncate max-w-[100px]">{value}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-ink"
        title="Copier"
      >
        {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
      </button>
    </div>
  );
}

interface TransactionsTableProps {
  transactions: TransactionRead[];
  loading?: boolean;
  onRowClick?: (t: TransactionRead) => void;
}

export function TransactionsTable({ transactions, loading, onRowClick }: TransactionsTableProps) {
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<TransactionRead, unknown>[]>(
    () => [
      {
        id: "utilisateur",
        header: "Utilisateur",
        cell: ({ row }) => {
          const u = row.original.user;
          if (!u) return <span className="text-xs text-muted-foreground">—</span>;
          return (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navigate(`/users/${u.id}`); }}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {getInitials(u.nom, u.prenom)}
              </div>
              <div>
                <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                  {u.prenom} {u.nom}
                </p>
                <p className="text-xs text-muted-foreground">{formatPhoneNumber(u.telephone)}</p>
              </div>
            </button>
          );
        },
      },
      {
        accessorKey: "operateur",
        header: "Opérateur",
        cell: ({ getValue }) => {
          const op = getValue() as TransactionOperateur;
          const conf = OPERATOR_CONFIG[op] ?? { label: op, dot: "bg-muted" };
          return (
            <div className="flex items-center gap-2">
              <span className={`size-2 rounded-full shrink-0 ${conf.dot}`} />
              <span className="text-sm font-medium">{conf.label}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ getValue }) => {
          const t = getValue() as TransactionType;
          return (
            <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
              CREDIT_TYPES.has(t)
                ? "bg-success/10 text-success"
                : "bg-surface text-muted-foreground"
            }`}>
              {TYPE_LABELS[t] ?? t}
            </span>
          );
        },
      },
      {
        accessorKey: "montant",
        header: "Montant",
        cell: ({ row }) => {
          const amount = row.original.montant;
          const isCredit = CREDIT_TYPES.has(row.original.type);
          return (
            <span className={`text-sm font-bold ${
              isCredit ? "text-success" : "text-ink"
            }`}>
              {isCredit ? "+" : ""}{formatCurrency(amount)}
            </span>
          );
        },
      },
      {
        accessorKey: "statut",
        header: "Statut",
        cell: ({ getValue }) => {
          const s = getValue() as TransactionStatut;
          const conf = STATUT_CONFIG[s] ?? { label: s, variant: "neutral" as const };
          return <StatusBadge label={conf.label} variant={conf.variant} dot />;
        },
      },
      {
        accessorKey: "reference_externe",
        header: "Réf. MoMo",
        cell: ({ getValue }) => {
          const ref = getValue() as string | null;
          return ref ? <CopyRef value={ref} /> : <span className="text-xs text-muted-foreground">—</span>;
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
    ],
    [navigate],
  );

  return (
    <DataTable
      data={transactions}
      columns={columns}
      onRowClick={onRowClick}
      loading={loading}
      emptyMessage="Aucune transaction"
      pageSize={20}
    />
  );
}
