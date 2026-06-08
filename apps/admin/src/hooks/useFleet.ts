import { useState, useCallback, useEffect } from "react";
import { useWebSocket } from "./useWebSocket";
import { get } from "@/lib/api";
import type { DriverLive, TripLive, FleetSummary } from "@/types/domain";

interface FleetSnapshot {
  type: "fleet_snapshot";
  drivers: DriverLive[];
  trips: TripLive[];
}

interface DriverUpdateMsg {
  type: "driver_update";
  driver: DriverLive;
}

interface DriverOfflineMsg {
  type: "driver_offline";
  driver_id: string;
}

type FleetMessage = FleetSnapshot | DriverUpdateMsg | DriverOfflineMsg;

export function useFleet() {
  const [drivers, setDrivers] = useState<DriverLive[]>([]);
  const [trips, setTrips] = useState<TripLive[]>([]);

  const handleMessage = useCallback((msg: unknown) => {
    const m = msg as FleetMessage;
    if (m.type === "fleet_snapshot") {
      setDrivers(m.drivers);
      setTrips(m.trips);
    } else if (m.type === "driver_update") {
      setDrivers((prev) => {
        const exists = prev.find((d) => d.id === m.driver.id);
        return exists
          ? prev.map((d) => (d.id === m.driver.id ? m.driver : d))
          : [...prev, m.driver];
      });
    } else if (m.type === "driver_offline") {
      setDrivers((prev) => prev.filter((d) => d.id !== m.driver_id));
    }
  }, []);

  const { isConnected, send } = useWebSocket("admin/fleet", {
    onMessage: handleMessage,
  });

  // Heartbeat pour maintenir la connexion
  useEffect(() => {
    if (!isConnected) return;
    const t = setInterval(() => send("ping"), 25_000);
    return () => clearInterval(t);
  }, [isConnected, send]);

  // Polling REST de secours si WS non connecté (toutes les 15s)
  useEffect(() => {
    if (isConnected) return;
    const poll = async () => {
      try {
        const data = await get<{ drivers: DriverLive[]; trips: TripLive[] }>("/admin/fleet");
        setDrivers(data.drivers);
        setTrips(data.trips);
      } catch {}
    };
    poll();
    const t = setInterval(poll, 15_000);
    return () => clearInterval(t);
  }, [isConnected]);

  const summary: FleetSummary = {
    total: drivers.length,
    online: drivers.length,
    inTrip: drivers.filter((d) => d.status === "in_trip").length,
    available: drivers.filter((d) => d.status === "available").length,
  };

  return { drivers, trips, summary, isConnected };
}

export function useVoyageTracking(voyageId: string | null) {
  const [position, setPosition] = useState<{
    lat: number;
    lng: number;
    vitesse: number;
    heading: number;
    timestamp: string;
  } | null>(null);

  useWebSocket(`tracking/voyage/${voyageId}`, {
    enabled: !!voyageId,
    onMessage: (msg) => {
      const m = msg as { type: string; lat: number; lng: number; vitesse: number; heading: number; timestamp: string };
      if (m.type === "position_update") setPosition(m);
    },
  });

  return { position };
}
