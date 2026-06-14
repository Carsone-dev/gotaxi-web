import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from "react";
import { cn } from "./utils";
export const Input = forwardRef(({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (_jsxs("div", { className: "w-full", children: [label && (_jsx("label", { htmlFor: inputId, className: "mb-1.5 block text-sm font-medium text-ink", children: label })), _jsx("input", { ref: ref, id: inputId, className: cn("w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-surface disabled:opacity-60", error && "border-error focus:border-error focus:ring-error", className), ...props }), error && _jsx("p", { className: "mt-1 text-xs text-error", children: error }), !error && hint && _jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: hint })] }));
});
Input.displayName = "Input";
