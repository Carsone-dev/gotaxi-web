import { useState } from "react";
import { Card, CardHeader, CardContent } from "@gotaxi/ui";
import { cn } from "@gotaxi/ui";
import { useActivityFeed } from "@/hooks/useAdmin";
import { useWebSocket } from "@/hooks/useWebSocket";
import { formatRelativeTime } from "@/lib/format";
import type { ActivityEvent } from "@/types/domain";

export function ActivityFeed() {
  const { data: initial } = useActivityFeed();
  const [live, setLive] = useState<ActivityEvent[]>([]);

  const { isConnected } = useWebSocket("admin/activity", {
    onMessage: (msg) => {
      const m = msg as { type: string; event: ActivityEvent };
      if (m.type === "activity" && m.event) {
        setLive((prev) => [m.event, ...prev].slice(0, 30));
      }
    },
  });

  const events = [...live, ...(initial ?? [])].slice(0, 12);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">Activité en direct</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  isConnected ? "bg-primary animate-pulse" : "bg-muted-foreground",
                )}
              />
              <span className="text-2xs text-muted-foreground">
                {isConnected ? "En direct" : "Reconnexion..."}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-0.5 max-h-64 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-center py-6 text-sm text-muted-foreground">
              Aucune activité récente
            </p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-xl px-3 py-2 hover:bg-surface transition-colors"
              >
                <span className="text-lg leading-none mt-0.5">{event.icon ?? "📍"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug truncate">{event.message}</p>
                  <p className="text-2xs text-muted-foreground mt-0.5">
                    {formatRelativeTime(event.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
