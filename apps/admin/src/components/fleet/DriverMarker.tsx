import { cn } from "@gotaxi/ui";
import type { DriverLive } from "@/types/domain";

const colors: Record<DriverLive["status"], string> = {
  available: "bg-primary",
  in_trip: "bg-accent-yellow",
  passenger_pickup: "bg-info",
  package_pickup: "bg-error",
};

const ringColors: Record<DriverLive["status"], string> = {
  available: "ring-primary/40",
  in_trip: "ring-accent-yellow/40",
  passenger_pickup: "ring-info/40",
  package_pickup: "ring-error/40",
};

interface DriverMarkerProps {
  driver: DriverLive;
  selected?: boolean;
}

export function DriverMarker({ driver, selected }: DriverMarkerProps) {
  return (
    <div className="relative cursor-pointer" title={`${driver.prenom} ${driver.nom}`}>
      {driver.status !== "available" && (
        <div
          className={cn(
            "absolute inset-0 -m-2 animate-ping rounded-full opacity-30",
            colors[driver.status],
          )}
        />
      )}
      <div
        className={cn(
          "size-5 rounded-full ring-2 ring-white transition-transform",
          colors[driver.status],
          selected && cn("scale-125 ring-4", ringColors[driver.status]),
        )}
      />
    </div>
  );
}
