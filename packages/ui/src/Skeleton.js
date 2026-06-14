import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "./utils";
export function Skeleton({ className, ...props }) {
    return (_jsx("div", { className: cn("animate-pulse rounded-lg bg-surface-alt", className), ...props }));
}
