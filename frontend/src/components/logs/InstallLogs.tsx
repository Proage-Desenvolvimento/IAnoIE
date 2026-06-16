import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { InstallLog } from "@/lib/types";

interface InstallLogsProps {
  logs: InstallLog[];
  className?: string;
}

const LEVEL_COLOR: Record<InstallLog["level"], string> = {
  error: "text-red-400",
  warn: "text-amber-400",
  info: "text-zinc-300",
  debug: "text-zinc-500",
};

/** Terminal-style panel showing installation lifecycle events (app_logs).
 *  Reuses the LogViewer look but takes pre-fetched logs (no WebSocket). */
export function InstallLogs({ logs, className }: InstallLogsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-medium text-zinc-400">Installation log</span>
        <span className="ml-auto text-[11px] text-zinc-600">{logs.length} events</span>
      </div>

      <div
        ref={scrollRef}
        className="overflow-auto p-3 font-mono text-xs leading-5 min-h-[140px] max-h-[280px]"
      >
        {logs.length === 0 ? (
          <div className="text-zinc-600">Waiting for output…</div>
        ) : (
          logs.map((entry) => (
            <div key={entry.id} className="flex gap-2 hover:bg-zinc-900/50">
              <span className="shrink-0 text-zinc-600">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
              {entry.container_name && (
                <span className="w-28 shrink-0 truncate text-zinc-600" title={entry.container_name}>
                  {entry.container_name.replace("ianoie-", "").replace(/-\d+-/, "-")}
                </span>
              )}
              <span className={cn("whitespace-pre-wrap break-all", LEVEL_COLOR[entry.level])}>
                {entry.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
