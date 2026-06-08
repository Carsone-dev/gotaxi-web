import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Spinner } from "@gotaxi/ui";

const Layout = lazy(() => import("./_layout"));
const Login = lazy(() => import("./login"));
const Dashboard = lazy(() => import("./dashboard"));
const Fleet = lazy(() => import("./fleet"));
const Users = lazy(() => import("./users/index"));
const UserDetail = lazy(() => import("./users/[id]"));
const Chauffeurs = lazy(() => import("./chauffeurs/index"));
const ChauffeurDetail = lazy(() => import("./chauffeurs/[id]"));
const KycPending = lazy(() => import("./chauffeurs/kyc-pending"));
const Voyages = lazy(() => import("./voyages/index"));
const VoyageDetail = lazy(() => import("./voyages/[id]"));
const Colis = lazy(() => import("./colis/index"));
const ColisPending = lazy(() => import("./colis/pending"));
const ColisInTransit = lazy(() => import("./colis/in-transit"));
const ColisDetail = lazy(() => import("./colis/[id]"));
const Reservations = lazy(() => import("./reservations/index"));
const Transactions = lazy(() => import("./transactions/index"));
const Reviews = lazy(() => import("./reviews/index"));
const Disputes = lazy(() => import("./reviews/disputes"));
const Audit = lazy(() => import("./audit/index"));
const Settings = lazy(() => import("./settings/index"));

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "fleet", element: <Fleet /> },
      { path: "users", element: <Users /> },
      { path: "users/:id", element: <UserDetail /> },
      { path: "chauffeurs", element: <Chauffeurs /> },
      { path: "chauffeurs/kyc-pending", element: <KycPending /> },
      { path: "chauffeurs/:id", element: <ChauffeurDetail /> },
      { path: "voyages", element: <Voyages /> },
      { path: "voyages/:id", element: <VoyageDetail /> },
      { path: "colis", element: <Colis /> },
      { path: "colis/pending", element: <ColisPending /> },
      { path: "colis/in-transit", element: <ColisInTransit /> },
      { path: "colis/:id", element: <ColisDetail /> },
      { path: "reservations", element: <Reservations /> },
      { path: "transactions", element: <Transactions /> },
      { path: "reviews", element: <Reviews /> },
      { path: "reviews/disputes", element: <Disputes /> },
      {
        path: "audit",
        element: (
          <ProtectedRoute requireRole="SUPER_ADMIN">
            <Audit />
          </ProtectedRoute>
        ),
      },
      { path: "settings", element: <Settings /> },
    ],
  },
]);

export function AppRouter() {
  return (
    <Suspense fallback={<Spinner fullScreen />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
