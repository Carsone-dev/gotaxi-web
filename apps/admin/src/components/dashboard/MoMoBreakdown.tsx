import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardContent, Skeleton } from "@gotaxi/ui";
import { useMoMoStats } from "@/hooks/useAdmin";
import type { TransactionOperateur } from "@/types/domain";

const OPERATOR_LABELS: Record<TransactionOperateur, string> = {
  FEDAPAY:      "FedaPay",
  MTN_MOMO:     "MTN MoMo",
  MOOV_MONEY:   "Moov Money",
  ORANGE_MONEY: "Orange Money",
  CELTIS:       "Celtis",
  WALLET:       "Wallet",
};

const OPERATOR_COLORS: Record<TransactionOperateur, string> = {
  FEDAPAY:      "#10B981",
  MTN_MOMO:     "#FFD700",
  MOOV_MONEY:   "#00B7E2",
  ORANGE_MONEY: "#FF6600",
  CELTIS:       "#A855F7",
  WALLET:       "#009542",
};

export function MoMoBreakdown() {
  const { data, isLoading } = useMoMoStats();

  const chartData = (data ?? []).map((s) => ({
    name: s.operateur,
    value: s.volume,
    pct: s.pct,
  }));

  return (
    <Card>
      <CardHeader>
        <p className="text-sm font-bold">Volumes Mobile Money</p>
        <p className="text-xs text-muted-foreground">Répartition par opérateur</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie data={chartData} dataKey="value" cx="50%" cy="50%" outerRadius={45} innerRadius={28}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={OPERATOR_COLORS[entry.name as TransactionOperateur] ?? "#ccc"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.[0] ? (
                      <div className="rounded-lg bg-ink px-2 py-1 text-xs text-white">
                        {payload[0].name}: {payload[0].value?.toLocaleString("fr-FR")} F
                      </div>
                    ) : null
                  }
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex-1 space-y-2">
              {(data ?? []).map((stat) => (
                <div key={stat.operateur} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: OPERATOR_COLORS[stat.operateur] }}
                    />
                    <span className="text-xs font-semibold">{OPERATOR_LABELS[stat.operateur] ?? stat.operateur}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold">
                      {stat.volume.toLocaleString("fr-FR")} F
                    </span>
                    <span className="ml-2 text-2xs text-muted-foreground">
                      {stat.pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
