import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { OperatorCard } from "@/components/transactions/OperatorCard";
import { useMoMoStats } from "@/hooks/useAdmin";
import { useMyTransactions as useTransactions } from "@/hooks/useTransactions";

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTransactions(page);
  const { data: momoStats } = useMoMoStats();

  const transactions = data?.items ?? [];

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle="Paiements Mobile Money"
      />

      {momoStats && momoStats.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {momoStats.map((stat) => (
            <OperatorCard key={stat.operateur} stat={stat} />
          ))}
        </div>
      )}

      <div className="mt-6">
        <TransactionsTable
          transactions={transactions}
          loading={isLoading}
        />
      </div>

      {data && data.pages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-surface disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {data.page} / {data.pages}
          </span>
          <button
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-surface disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}
    </>
  );
}
