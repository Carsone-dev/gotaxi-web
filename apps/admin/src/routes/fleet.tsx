import { useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useFleet } from "@/hooks/useFleet";
import { DriverMarker } from "@/components/fleet/DriverMarker";
import { ActiveTripsPanel } from "@/components/fleet/ActiveTripsPanel";
import { MapLegend } from "@/components/fleet/MapLegend";
import { cn } from "@gotaxi/ui";
import type { DriverLive } from "@/types/domain";

const FREE_MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

function DriverPopup({ driver, onClose }: { driver: DriverLive; onClose: () => void }) {
  const statusLabel: Record<DriverLive["status"], string> = {
    available: "Disponible",
    in_trip: "En course",
    passenger_pickup: "Prise en charge",
    package_pickup: "Collecte colis",
  };
  return (
    <div className="rounded-xl bg-white p-3 shadow-card min-w-[180px]">
      <div className="flex items-center gap-2">
        {driver.photo_url ? (
          <img src={driver.photo_url} alt="" className="size-9 rounded-xl object-cover" />
        ) : (
          <div className="flex size-9 items-center justify-center rounded-xl bg-surface font-bold text-sm text-muted-foreground">
            {driver.prenom.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm font-bold">{driver.prenom} {driver.nom}</p>
          <p className="text-xs text-muted-foreground">{statusLabel[driver.status]}</p>
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>📍 {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}</span>
        {driver.vitesse > 0 && <span>{driver.vitesse} km/h</span>}
      </div>
      <button
        onClick={onClose}
        className="mt-2 w-full rounded-lg border border-border py-1 text-xs text-muted-foreground hover:bg-surface"
      >
        Fermer
      </button>
    </div>
  );
}

function Stat({ label, value, color = "text-ink" }: { label: string; value: number; color?: string }) {
  return (
    <div className="text-center">
      <p className={`text-base font-extrabold ${color}`}>{value}</p>
      <p className="text-2xs text-muted-foreground">{label}</p>
    </div>
  );
}

function SummaryBox({ summary, className }: {
  summary: ReturnType<typeof useFleet>["summary"];
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl bg-white/90 p-3 shadow-card backdrop-blur-sm border border-border", className)}>
      <div className="flex gap-5">
        <Stat label="Total" value={summary.total} />
        <Stat label="En ligne" value={summary.online} color="text-primary" />
        <Stat label="En course" value={summary.inTrip} color="text-accent-yellow-dark" />
        <Stat label="Dispo." value={summary.available} />
      </div>
    </div>
  );
}

export default function FleetPage() {
  const { drivers, trips, summary, isConnected } = useFleet();
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId) ?? null;

  return (
    <div className="-m-6 lg:-m-8 flex h-[calc(100vh-64px)]">
      <div className="relative flex-1">
        <Map
          initialViewState={{ longitude: 2.3912, latitude: 6.3703, zoom: 7 }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={FREE_MAP_STYLE}
          onClick={() => setSelectedDriverId(null)}
        >
          <NavigationControl position="bottom-right" />

          <MapLegend className="absolute right-10 top-4 z-10" />

          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-2 shadow-soft backdrop-blur-sm border border-border">
            <span
              className={cn(
                "size-1.5 rounded-full",
                isConnected ? "bg-primary animate-pulse" : "bg-error",
              )}
            />
            <span className="text-xs font-semibold text-ink">
              {isConnected ? "Temps réel" : "Reconnexion..."}
            </span>
          </div>

          {drivers.map((driver) => (
            <Marker
              key={driver.id}
              longitude={driver.lng}
              latitude={driver.lat}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedDriverId(driver.id === selectedDriverId ? null : driver.id);
              }}
            >
              <DriverMarker driver={driver} selected={driver.id === selectedDriverId} />
            </Marker>
          ))}

          {selectedDriver && (
            <Popup
              longitude={selectedDriver.lng}
              latitude={selectedDriver.lat}
              onClose={() => setSelectedDriverId(null)}
              closeButton={false}
              offset={16}
            >
              <DriverPopup driver={selectedDriver} onClose={() => setSelectedDriverId(null)} />
            </Popup>
          )}
        </Map>

        <SummaryBox summary={summary} className="absolute bottom-6 left-4 z-10" />

        {drivers.length === 0 && isConnected && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="rounded-2xl bg-white/90 px-6 py-4 text-center shadow-card backdrop-blur-sm border border-border">
              <p className="text-2xl">🚗</p>
              <p className="mt-2 text-sm font-semibold text-ink">Aucun chauffeur en ligne</p>
              <p className="text-xs text-muted-foreground">Les véhicules apparaissent dès qu'un chauffeur se connecte</p>
            </div>
          </div>
        )}
      </div>

      <ActiveTripsPanel
        trips={trips}
        className="w-80 shrink-0 border-l border-border bg-white"
      />
    </div>
  );
}
