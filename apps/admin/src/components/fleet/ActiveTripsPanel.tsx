import { cn } from "@gotaxi/ui";
import { ArrowRight, Users } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { TripLive } from "@/types/domain";

interface ActiveTripsPanelProps {
  trips: TripLive[];
  className?: string;
}

export function ActiveTripsPanel({ trips, className }: ActiveTripsPanelProps) {
  return (
    <div className={cn("flex flex-col overflow-hidden", className)}>
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-bold">Voyages actifs</p>
        <p className="text-xs text-muted-foreground">{trips.length} en cours</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {trips.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">Aucun voyage actif</p>
          </div>
        ) : (
          trips.map((trip) => (
            <div
              key={trip.id}
              className="border-b border-border px-4 py-3 hover:bg-surface transition-colors"
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium truncate">{trip.ville_depart}</span>
                <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
                <span className="font-medium truncate">{trip.ville_arrivee}</span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{formatDate(trip.date_depart, "HH:mm")}</span>
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {trip.passagers}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-2xs font-semibold",
                    trip.statut === "EN_COURS"
                      ? "bg-success-bg text-success-text"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {trip.statut.replace("_", " ")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
