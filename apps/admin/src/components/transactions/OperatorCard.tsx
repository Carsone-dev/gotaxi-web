import type { MoMoStat } from "@/types/domain";
import { formatCurrency } from "@/lib/format";

const COLORS: Record<string, { bg: string; text: string; border: string; bar: string; label: string }> = {
  MTN_MOMO:    { bg: "bg-yellow-50", text: "text-yellow-800", border: "border-yellow-200", bar: "bg-yellow-400", label: "MTN MoMo"     },
  MOOV_MONEY:  { bg: "bg-sky-50",    text: "text-sky-800",    border: "border-sky-200",    bar: "bg-sky-400",    label: "Moov Money"   },
  ORANGE_MONEY:{ bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200", bar: "bg-orange-400", label: "Orange Money" },
  WALLET:      { bg: "bg-success-bg",text: "text-success",    border: "border-success/20", bar: "bg-success",    label: "Wallet"       },
};

export function OperatorCard({ stat }: { stat: MoMoStat }) {
  const color = COLORS[stat.operateur] ?? {
    bg: "bg-surface", text: "text-ink", border: "border-border", bar: "bg-muted", label: stat.operateur,
  };

  return (
    <div className={`rounded-2xl border p-4 ${color.bg} ${color.border}`}>
      <div className="flex items-center justify-between gap-2">
        <p className={`text-sm font-extrabold ${color.text}`}>{color.label}</p>
        <span className={`rounded-full bg-white/70 px-2 py-0.5 text-xs font-bold ${color.text}`}>
          {stat.pct.toFixed(0)}%
        </span>
      </div>

      <p className={`mt-2 text-xl font-extrabold ${color.text}`}>
        {formatCurrency(stat.volume)}
      </p>
      <p className={`mt-0.5 text-xs ${color.text} opacity-70`}>
        {stat.count} transaction{stat.count !== 1 ? "s" : ""}
      </p>

      {/* Barre de progression */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/50">
        <div
          className={`h-full rounded-full ${color.bar} transition-all`}
          style={{ width: `${Math.min(stat.pct, 100)}%` }}
        />
      </div>
    </div>
  );
}
