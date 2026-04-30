import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useLogStream } from "@/hooks/useLogStream";
import { Search, Terminal, Trash2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LogViewerProps {
  installationId: number;
  className?: string;
}

export function LogViewer({ installationId, className }: LogViewerProps) {
  const { logs, isConnected } = useLogStream(installationId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [search, setSearch] = useState("");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 50);
  };

  const filtered = search
    ? logs.filter((l) => l.line.toLowerCase().includes(search.toLowerCase()))
    : logs;

  const containers = [...new Set(logs.map((l) => l.container_name))];

  return (
    <div className={cn("flex flex-col rounded-lg border border-zinc-200 bg-zinc-950 overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-3 py-2">
        <Terminal className="h-3.5 w-3.5 text-zinc-500" />
        <span className="text-xs font-medium text-zinc-400">
          {isConnected ? "Live" : "Disconnected"}
        </span>
        {isConnected && (
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        )}
        {containers.length > 0 && (
          <span className="text-xs text-zinc-600">
            {containers.length} container{containers.length > 1 ? "s" : ""}
          </span>
        )}
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter logs..."
            className="h-7 w-44 rounded-md border border-zinc-700 bg-zinc-800 pl-7 pr-2 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPaused(!paused)}
          className="text-zinc-400 hover:text-zinc-200 h-7 px-2"
        >
          {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAutoScroll(true)}
          className="text-zinc-400 hover:text-zinc-200 h-7 px-2"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Log content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto p-3 font-mono text-xs leading-5 min-h-[300px] max-h-[500px]"
      >
        {filtered.length === 0 ? (
          <div className="text-zinc-600">No logs yet{isConnected ? " — waiting for output..." : ""}</div>
        ) : (
          filtered.map((entry, i) => (
            <div key={i} className="flex gap-2 hover:bg-zinc-900/50">
              {containers.length > 1 && (
                <span className="w-24 shrink-0 truncate text-zinc-600" title={entry.container_name}>
                  {entry.container_name.replace("ianoie-", "")}
                </span>
              )}
              <span className="text-zinc-300 whitespace-pre-wrap break-all">{entry.line}</span>
            </div>
          ))
        )}
      </div>

      {/* Scroll to bottom indicator */}
      {!autoScroll && (
        <button
          onClick={() => {
            setAutoScroll(true);
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }}
          className="absolute bottom-14 left-1/2 -translate-x-1/2 rounded-full bg-zinc-700 px-3 py-1 text-xs text-zinc-200 shadow-lg hover:bg-zinc-600"
        >
          Scroll to bottom
        </button>
      )}
    </div>
  );
}
