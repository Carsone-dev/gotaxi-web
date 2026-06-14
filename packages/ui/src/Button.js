import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "./utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none", {
    variants: {
        variant: {
            primary: "bg-primary text-white hover:bg-primary-600 active:bg-primary-700",
            secondary: "bg-ink text-white hover:bg-ink-soft",
            outline: "border border-border bg-white text-ink hover:bg-surface",
            ghost: "text-ink hover:bg-surface",
            destructive: "bg-error text-white hover:bg-error/90",
        },
        size: {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base",
            icon: "h-10 w-10",
        },
    },
    defaultVariants: { variant: "primary", size: "md" },
});
export const Button = forwardRef(({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => (_jsxs("button", { ref: ref, disabled: disabled ?? loading, className: cn(buttonVariants({ variant, size }), className), ...props, children: [loading ? _jsx(Loader2, { className: "size-4 animate-spin" }) : leftIcon, children, !loading && rightIcon] })));
Button.displayName = "Button";
