import { cn } from "@gotaxi/ui";

interface LegendItem {
  color: string;
  label: string;
}

const items: LegendItem[] = [
  { color: "bg-primary", label: "Disponible" },
  { color: "bg-accent-yellow", label: "En course" },
  { color: "bg-info", label: "Prise passager" },
  { color: "bg-error", label: "Prise colis" },
];

interface MapLegendProps {
  className?: string;
}

export function MapLegend({ className }: MapLegendProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white/90 p-3 shadow-card backdrop-blur-sm",
        className,
      )}
    >
      <p className="mb-2 text-2xs font-bold uppercase tracking-wider text-muted-foreground">
        Légende
      </p>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={cn("size-2.5 rounded-full", item.color)} />
            <span className="text-xs text-ink">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
