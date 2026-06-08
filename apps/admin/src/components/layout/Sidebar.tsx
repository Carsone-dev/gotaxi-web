import { NavLink } from "react-router-dom";
import { cn } from "@gotaxi/ui";
import {
  LayoutDashboard, Map, Users, Car, Route as RouteIcon, Package,
  CreditCard, Star, Lock, Settings, CalendarCheck,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useAdminPendingColis } from "@/hooks/useAdmin";
import { UserProfileDropdown } from "./UserProfileDropdown";
import type { UserRole } from "@/types/domain";

const sections: Array<{
  title: string;
  items: Array<{
    to: string;
    icon: React.ElementType;
    label: string;
    requireRole?: UserRole;
    badgeKey?: string;
  }>;
}> = [
  {
    title: "PILOTAGE",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Vue d'ensemble" },
      { to: "/fleet", icon: Map, label: "Carte flotte" },
    ],
  },
  {
    title: "GESTION",
    items: [
      { to: "/users", icon: Users, label: "Utilisateurs" },
      { to: "/chauffeurs", icon: Car, label: "Chauffeurs" },
      { to: "/voyages", icon: RouteIcon, label: "Voyages" },
      { to: "/colis", icon: Package, label: "Colis", badgeKey: "colisPending" },
      { to: "/reservations", icon: CalendarCheck, label: "Réservations" },
    ],
  },
  {
    title: "FINANCES",
    items: [
      { to: "/transactions", icon: CreditCard, label: "Transactions" },
    ],
  },
  {
    title: "AUTRE",
    items: [
      { to: "/reviews", icon: Star, label: "Avis & litiges" },
      { to: "/audit", icon: Lock, label: "Audit", requireRole: "SUPER_ADMIN" },
      { to: "/settings", icon: Settings, label: "Paramètres" },
    ],
  },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const { data: pendingColis } = useAdminPendingColis();

  const badges: Record<string, number | undefined> = {
    colisPending: pendingColis?.length,
  };

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-ink text-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-white font-black text-sm">G</div>
        <span className="text-base font-extrabold">
          Go<span className="text-primary-400">Taxi</span>{" "}
          <span className="ml-1 rounded-md bg-white/10 px-1.5 py-0.5 text-2xs">ADMIN</span>
        </span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-3">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-2xs font-bold tracking-wider text-white/40">
              {section.title}
            </p>
            {section.items
              .filter((it) => !it.requireRole || it.requireRole === user?.role || user?.role === "SUPER_ADMIN")
              .map((item) => {
                const badge = item.badgeKey ? badges[item.badgeKey] : undefined;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                        isActive
                          ? "border-l-[3px] border-primary-400 bg-primary/15 font-semibold text-white"
                          : "text-white/70 hover:bg-white/5 hover:text-white",
                      )
                    }
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {badge != null && badge > 0 && (
                      <span className="rounded-full bg-error px-1.5 py-0.5 text-2xs font-bold">
                        {badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
          </div>
        ))}
      </nav>

      <UserProfileDropdown />
    </aside>
  );
}
