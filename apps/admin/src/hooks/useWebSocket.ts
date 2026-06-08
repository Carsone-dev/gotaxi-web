import { useEffect, useRef, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";

interface Options {
  onMessage?: (msg: unknown) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectDelay?: number;
  enabled?: boolean;
}

export function useWebSocket(channel: string, options: Options = {}) {
  const { onMessage, onConnect, onDisconnect, reconnectDelay = 3000, enabled = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!enabled) return;
    const token = useAuthStore.getState().accessToken;
    const url = `${import.meta.env.VITE_WS_URL}/${channel}?token=${token}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      onConnect?.();
    };
    ws.onclose = () => {
      setIsConnected(false);
      onDisconnect?.();
      timerRef.current = setTimeout(connect, reconnectDelay);
    };
    ws.onmessage = (e) => {
      try {
        onMessage?.(JSON.parse(e.data));
      } catch {}
    };
    ws.onerror = () => ws.close();
  }, [channel, enabled, reconnectDelay, onMessage, onConnect, onDisconnect]);

  useEffect(() => {
    connect();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data: unknown) => {
    wsRef.current?.send(JSON.stringify(data));
  }, []);

  return { isConnected, send };
}
