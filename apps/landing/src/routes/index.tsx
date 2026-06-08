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
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "search", element: <SearchPage /> },
      { path: "track/:reference", element: <TrackPage /> },
      { path: "voyager", element: <VoyagerPage /> },
      { path: "colis", element: <ColisPage /> },
      { path: "chauffeur", element: <ChauffeurPage /> },
    ],
  },
]);

export const AppRouter = () => (
  <Suspense
    fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }
  >
    <RouterProvider router={router} />
  </Suspense>
);
