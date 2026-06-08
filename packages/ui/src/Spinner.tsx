import { cn } from "./utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
}

export function Spinner({ size = "md", className, fullScreen }: SpinnerProps) {
  const sizeClasses = { sm: "size-4", md: "size-6", lg: "size-10" };

  if (fullScreen) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className={cn("animate-spin rounded-full border-2 border-surface border-t-primary", sizeClasses[size], className)} />
      </div>
    );
  }

  return (
    <div className={cn("animate-spin rounded-full border-2 border-surface border-t-primary", sizeClasses[size], className)} />
  );
}
