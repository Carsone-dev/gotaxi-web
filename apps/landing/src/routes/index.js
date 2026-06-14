import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
const Layout = lazy(() => import("./_layout"));
const HomePage = lazy(() => import("./home"));
const SearchPage = lazy(() => import("./search"));
const TrackPage = lazy(() => import("./track/[reference]"));
const VoyagerPage = lazy(() => import("./voyager"));
const ColisPage = lazy(() => import("./colis"));
const ChauffeurPage = lazy(() => import("./chauffeur"));
const router = createBrowserRouter([
    {
        path: "/",
        element: _jsx(Layout, {}),
        children: [
            { index: true, element: _jsx(HomePage, {}) },
            { path: "search", element: _jsx(SearchPage, {}) },
            { path: "track/:reference", element: _jsx(TrackPage, {}) },
            { path: "voyager", element: _jsx(VoyagerPage, {}) },
            { path: "colis", element: _jsx(ColisPage, {}) },
            { path: "chauffeur", element: _jsx(ChauffeurPage, {}) },
        ],
    },
]);
export const AppRouter = () => (_jsx(Suspense, { fallback: _jsx("div", { className: "flex min-h-screen items-center justify-center", children: _jsx("div", { className: "size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }), children: _jsx(RouterProvider, { router: router }) }));
