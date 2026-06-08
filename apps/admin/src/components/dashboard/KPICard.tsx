import { cn, Skeleton } from "@gotaxi/ui";

interface KPICardProps {
  label: string;
  value: React.ReactNode;
  sublabel?: React.ReactNode;
  sublabelColor?: "default" | "success" | "warning" | "error";
  delta?: string;
  variant?: "light" | "dark";
  loading?: boolean;
  icon?: React.ReactNode;
}

export function KPICard({
  label,
  value,
  sublabel,
  sublabelColor = "default",
  delta,
  variant = "light",
  loading,
  icon,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-5",
        variant === "dark"
          ? "bg-gradient-dark text-white"
          : "border border-border bg-white shadow-soft",
      )}
    >
      {variant === "dark" && (
        <div className="absolute -right-5 -top-5 size-24 rounded-full bg-primary-400/30 blur-2xl pointer-events-none" />
      )}
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-2xs font-bold tracking-wider uppercase",
              variant === "dark" ? "text-white/60" : "text-muted-foreground",
            )}
          >
            {label}
          </p>
          {icon && (
            <div
              className={cn(
                "rounded-lg p-1.5",
                variant === "dark" ? "bg-white/10" : "bg-surface",
              )}
            >
              {icon}
            </div>
          )}
        </div>

        {loading ? (
          <Skeleton className="mt-2 h-9 w-28" />
        ) : (
          <p className="mt-1.5 text-3xl font-extrabold leading-none">{value}</p>
        )}

        {delta && (
          <p className="mt-1.5 text-xs font-semibold text-primary-400">↗ {delta}</p>
        )}
        {sublabel && !loading && (
          <p
            className={cn(
              "mt-1 text-xs font-medium",
              sublabelColor === "success" && "text-success",
              sublabelColor === "warning" && "text-warning-text",
              sublabelColor === "error" && "text-error",
              sublabelColor === "default" &&
                (variant === "dark" ? "text-white/60" : "text-muted-foreground"),
            )}
          >
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}
