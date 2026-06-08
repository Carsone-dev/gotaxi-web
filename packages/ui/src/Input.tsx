import { forwardRef } from "react";
import { cn } from "./utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-surface disabled:opacity-60",
            error && "border-error focus:border-error focus:ring-error",
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
        {!error && hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
