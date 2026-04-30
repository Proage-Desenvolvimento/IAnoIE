import { useEffect, useRef, useState } from "react";
import { WS_URL } from "@/lib/constants";
import type { LogEntry } from "@/lib/types";

export function useLogStream(installationId: number | null) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!installationId) return;

    const token = localStorage.getItem("ianoie_token");
    const ws = new WebSocket(`${WS_URL}/api/v1/ws/logs/${installationId}?token=${token}`);

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onmessage = (event) => {
      const entry = JSON.parse(event.data) as LogEntry;
      setLogs((prev) => [...prev.slice(-2000), entry]);
    };

    wsRef.current = ws;
    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [installationId]);

  return { logs, isConnected };
}
