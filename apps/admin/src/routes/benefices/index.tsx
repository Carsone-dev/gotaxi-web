import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardContent } from "@gotaxi/ui";
import { Wallet, Package, CalendarCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { useAdminBenefices, useAdminTransactions } from "@/hooks/useAdmin";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { TransactionType } from "@/types/domain";

type Period = "7d" | "30d" | "90d";

export default function BeneficesPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "">("");
  const { data, isLoading } = useAdminBenefices(period);
  const { data: transactions, isLoading: transactionsLoading } = useAdminTransactions({
    page: 1,
    size: 25,
    statut: "REUSSI",
    type: typeFilter || undefined,
  });

  const recentFees = useMemo(
    () =>
      (transactions?.items ?? []).filter(
        (t) => t.type === "FRAIS_RESERVATION" || t.type === "FRAIS_COLIS",
      ),
    [transactions],
  );

  return (
    <>
      <PageHeader
        title="Bénéfices plateforme"
        subtitle="Frais collectés sur le compte FedaPay unique de l'application"
      />

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KPICard
          variant="dark"
          label="Total bénéfices"
          value={data ? formatCurrency(data.total_general) : "—"}
          icon={<Wallet className="size-4" />}
          loading={isLoading}
        />
        <KPICard
          label="Frais réservations"
          value={data ? formatCurrency(data.total_frais_reservation) : "—"}
          sublabel={data ? `${data.nb_reservations_payees} réservations payées` : undefined}
          icon={<CalendarCheck className="size-4" />}
          loading={isLoading}
        />
        <KPICard
          label="Frais colis"
          value={data ? formatCurrency(data.total_frais_colis) : "—"}
          sublabel={data ? `${data.nb_colis_payees} colis payés` : undefined}
          icon={<Package className="size-4" />}
          loading={isLoading}
        />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">Évolution des bénéfices</p>
              <p className="text-xs text-muted-foreground">En FCFA</p>
            </div>
            <div className="flex rounded-xl border border-border bg-surface p-0.5">
              {(["7d", "30d", "90d"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={
                    period === p
                      ? "rounded-lg bg-white px-3 py-1 text-xs font-semibold shadow-soft"
                      : "px-3 py-1 text-xs text-muted-foreground hover:text-ink"
                  }
                >
                  {p === "7d" ? "7j" : p === "30d" ? "30j" : "90j"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[220px] animate-pulse rounded-xl bg-surface" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={data?.evolution ?? []}
                margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1EFE8" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={9} />
                <YAxis tickLine={false} axisLine={false} fontSize={9} />
                <Tooltip
                  formatter={(value: number) => `${value.toLocaleString("fr-FR")} F`}
                />
                <Legend
                  formatter={(value) =>
                    value === "frais_reservation" ? "Réservations" : "Colis"
                  }
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Bar dataKey="frais_reservation" stackId="fees" fill="#009542" radius={[0, 0, 0, 0]} />
                <Bar dataKey="frais_colis" stackId="fees" fill="#00C957" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Frais collectés récemment</p>
            <div className="flex rounded-xl border border-border bg-surface p-0.5">
              {(
                [
                  { value: "", label: "Tous" },
                  { value: "FRAIS_RESERVATION", label: "Réservations" },
                  { value: "FRAIS_COLIS", label: "Colis" },
                ] as { value: TransactionType | ""; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setTypeFilter(opt.value)}
                  className={
                    typeFilter === opt.value
                      ? "rounded-lg bg-white px-3 py-1 text-xs font-semibold shadow-soft"
                      : "px-3 py-1 text-xs text-muted-foreground hover:text-ink"
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RecentFeesList loading={transactionsLoading} fees={recentFees} />
        </CardContent>
      </Card>
    </>
  );
}

function RecentFeesList({
  loading,
  fees,
}: {
  loading: boolean;
  fees: {
    id: string;
    type: TransactionType;
    montant: number;
    created_at: string;
    reservation_id: string | null;
    colis_id: string | null;
    user: { nom: string; prenom: string } | null;
  }[];
}) {
  const navigate = useNavigate();

  if (loading) {
    return <div className="h-[200px] animate-pulse rounded-xl bg-surface" />;
  }

  if (fees.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Aucun frais collecté pour le moment
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {fees.map((f) => {
        const target = f.reservation_id
          ? `/reservations/${f.reservation_id}`
          : f.colis_id
            ? `/colis/${f.colis_id}`
            : null;
        return (
          <button
            key={f.id}
            type="button"
            disabled={!target}
            onClick={() => target && navigate(target)}
            className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-surface/60 disabled:cursor-default disabled:hover:bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {f.type === "FRAIS_RESERVATION" ? (
                  <CalendarCheck className="size-4" />
                ) : (
                  <Package className="size-4" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {f.type === "FRAIS_RESERVATION" ? "Frais réservation" : "Frais colis"}
                  {f.user && <span className="text-muted-foreground"> · {f.user.prenom} {f.user.nom}</span>}
                </p>
                <p className="text-xs text-muted-foreground">{formatDateTime(f.created_at)}</p>
              </div>
            </div>
            <span className="text-sm font-bold text-success">+{formatCurrency(f.montant)}</span>
          </button>
        );
      })}
    </div>
  );
}
