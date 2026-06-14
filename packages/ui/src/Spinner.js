import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "./utils";
export function Spinner({ size = "md", className, fullScreen }) {
    const sizeClasses = { sm: "size-4", md: "size-6", lg: "size-10" };
    if (fullScreen) {
        return (_jsx("div", { className: "flex h-screen items-center justify-center", children: _jsx("div", { className: cn("animate-spin rounded-full border-2 border-surface border-t-primary", sizeClasses[size], className) }) }));
    }
    return (_jsx("div", { className: cn("animate-spin rounded-full border-2 border-surface border-t-primary", sizeClasses[size], className) }));
}
