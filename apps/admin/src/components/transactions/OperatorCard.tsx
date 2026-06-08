import type { MoMoStat } from "@/types/domain";
import { formatCurrency } from "@/lib/format";

const COLORS: Record<string, { bg: string; text: string; border: string }> = {
  MTN: { bg: "bg-yellow-50", text: "text-yellow-800", border: "border-yellow-200" },
  MOOV: { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200" },
  ORANGE: { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" },
  WALLET: { bg: "bg-success-bg", text: "text-success-text", border: "border-success/20" },
};

export function OperatorCard({ stat }: { stat: MoMoStat }) {
  const color = COLORS[stat.operateur] ?? { bg: "bg-surface", text: "text-ink", border: "border-border" };

  return (
    <div
      className={`rounded-2xl border p-4 ${color.bg} ${color.border}`}
    >
      <div className="flex items-center justify-between">
        <p className={`text-sm font-extrabold ${color.text}`}>{stat.operateur}</p>
        <span className="rounded-full bg-white/60 px-2.5 py-1 text-xs font-bold">
          {stat.pct.toFixed(0)}%
        </span>
      </div>
      <p className={`mt-2 text-xl font-extrabold ${color.text}`}>
        {formatCurrency(stat.volume)}
      </p>
      <p className="mt-0.5 text-xs opacity-70">{stat.count} transactions</p>
    </div>
  );
}
