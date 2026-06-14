import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import { AppRouter } from "./routes";
import "./styles/globals.css";
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(HelmetProvider, { children: _jsxs(QueryClientProvider, { client: queryClient, children: [_jsx(AppRouter, {}), _jsx(Toaster, { richColors: true, position: "top-right" })] }) }));
