import { Card, CardHeader, CardContent, Skeleton } from "@gotaxi/ui";
import { useTopRoutes } from "@/hooks/useAdmin";
import { ArrowRight } from "lucide-react";

export function TopRoutesList() {
  const { data, isLoading } = useTopRoutes();

  return (
    <Card>
      <CardHeader>
        <p className="text-sm font-bold">Top trajets</p>
        <p className="text-xs text-muted-foreground">Cette semaine</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            : (data ?? []).slice(0, 6).map((route, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-surface transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="flex size-5 items-center justify-center rounded-full bg-surface text-2xs font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="font-medium">{route.depart}</span>
                    <ArrowRight className="size-3 text-muted-foreground" />
                    <span className="font-medium">{route.arrivee}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold">{route.count} courses</p>
                    <p className="text-2xs text-muted-foreground">
                      {(route.revenue ?? 0).toLocaleString("fr-FR")} F
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  );
}
