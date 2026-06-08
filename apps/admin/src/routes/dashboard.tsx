import { RefreshCw } from "lucide-react";
import { Button } from "@gotaxi/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TopRoutesList } from "@/components/dashboard/TopRoutesList";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { MoMoBreakdown } from "@/components/dashboard/MoMoBreakdown";
import { useAdminOverview, useAdminKPIs } from "@/hooks/useAdmin";
import { useAuthStore } from "@/stores/authStore";
import { formatCurrency } from "@/lib/format";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: overview } = useAdminOverview();
  const { data: kpis, isLoading, refetch, isFetching } = useAdminKPIs();

  return (
    <>
      <PageHeader
        title={`Bonjour, ${user?.prenom ?? "Admin"} 👋`}
        subtitle="Voici ce qui se passe sur GoTaxi aujourd'hui"
        actions={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            className={isFetching ? "animate-spin" : ""}
          >
            <RefreshCw className="size-4" />
          </Button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          variant="dark"
          label="Revenus du jour"
          value={kpis ? formatCurrency(kpis.revenusJour) : "—"}
          loading={isLoading}
        />
        <KPICard
          label="Courses actives"
          value={kpis?.coursesActives ?? "—"}
          sublabel={kpis ? `${kpis.coursesEnRoute} en route` : undefined}
          loading={isLoading}
        />
        <KPICard
          label="Colis en cours"
          value={kpis?.colisEnCours ?? "—"}
          sublabel={kpis?.colisPending ? `⚠ ${kpis.colisPending} en attente` : undefined}
          sublabelColor="warning"
          loading={isLoading}
        />
        <KPICard
          label="Chauffeurs actifs"
          value={kpis ? `${kpis.chauffeursOnline}/${kpis.chauffeursTotal}` : "—"}
          sublabel={kpis ? `${kpis.chauffeursPctOnline}% en ligne` : undefined}
          loading={isLoading}
        />
      </div>

      {overview && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          <KPICard label="Utilisateurs total" value={overview.total_utilisateurs.toLocaleString("fr-FR")} />
          <KPICard label="Voyages total" value={overview.total_voyages.toLocaleString("fr-FR")} />
          <KPICard label="Colis total" value={overview.total_colis.toLocaleString("fr-FR")} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <RevenueChart />
        <TopRoutesList />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ActivityFeed />
        <MoMoBreakdown />
      </div>
    </>
  );
}
