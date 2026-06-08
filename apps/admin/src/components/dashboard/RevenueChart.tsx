import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardContent } from "@gotaxi/ui";
import { useRevenuesTrend } from "@/hooks/useAdmin";

type Period = "7d" | "30d" | "90d";

export function RevenueChart() {
  const [period, setPeriod] = useState<Period>("7d");
  const { data, isLoading } = useRevenuesTrend(period);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">Évolution des revenus</p>
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
          <div className="h-[180px] animate-pulse rounded-xl bg-surface" />
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart
              data={data?.points ?? []}
              margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00C957" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#00C957" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1EFE8" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={9} />
              <YAxis tickLine={false} axisLine={false} fontSize={9} />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.[0] ? (
                    <div className="rounded-lg bg-ink px-3 py-2 text-xs text-white shadow-card">
                      <strong>{(payload[0].value as number).toLocaleString("fr-FR")} F</strong>
                    </div>
                  ) : null
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#009542"
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-dashed border-border pt-4">
          <Stat label="Total semaine" value={data?.totalSemaine ?? "—"} />
          <Stat label="Trajets" value={data?.totalTrajets?.toLocaleString("fr-FR") ?? "—"} />
          <Stat label="Colis" value={data?.totalColis?.toLocaleString("fr-FR") ?? "—"} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="text-center">
      <p className="text-base font-extrabold text-ink">{value}</p>
      <p className="text-2xs text-muted-foreground">{label}</p>
    </div>
  );
}
