import { cn } from "@gotaxi/ui";

type Variant = "success" | "warning" | "error" | "info" | "neutral" | "purple";

interface StatusBadgeProps {
  label: string;
  variant?: Variant;
  dot?: boolean;
  className?: string;
}

const variants: Record<Variant, string> = {
  success: "bg-success-bg text-success-text",
  warning: "bg-warning-bg text-warning-text",
  error: "bg-error-bg text-error-text",
  info: "bg-info-bg text-info-text",
  neutral: "bg-muted text-muted-foreground",
  purple: "bg-purple-100 text-purple-700",
};

const dotColors: Record<Variant, string> = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info",
  neutral: "bg-muted-foreground",
  purple: "bg-purple-500",
};

export function StatusBadge({ label, variant = "neutral", dot, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-semibold",
        variants[variant],
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", dotColors[variant])} />}
      {label}
    </span>
  );
}
