import { useState } from "react";
import { Link } from "react-router-dom";
import { useInstallations, useUninstallApp, useAppAction } from "@/hooks/useInstallations";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { LogViewer } from "@/components/logs/LogViewer";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Play,
  Square,
  RotateCw,
  Trash2,
  ExternalLink,
  ScrollText,
  Box,
} from "lucide-react";
import type { Installation } from "@/lib/types";

export function MyAppsPage() {
  const { data, isLoading } = useInstallations();
  const uninstall = useUninstallApp();
  const action = useAppAction();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);

  const toggleLogs = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Installed Apps</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your AI applications
          </p>
        </div>
        <Link to="/catalog">
          <Button size="sm">
            <Box className="h-3.5 w-3.5" />
            Install New
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-zinc-200 bg-zinc-50 animate-pulse" />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <EmptyState
          icon={<Box className="h-6 w-6" />}
          title="No apps installed"
          description="Install applications from the catalog to get started"
          action={
            <Link to="/catalog">
              <Button size="sm">Browse Catalog</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {data?.items.map((inst) => (
            <InstallationRow
              key={inst.id}
              installation={inst}
              expanded={expandedId === inst.id}
              onToggleLogs={() => toggleLogs(inst.id)}
              onStart={() => {
                setPendingActionId(inst.id);
                action.mutate({ id: inst.id, action: "start" }, { onSettled: () => setPendingActionId(null) });
              }}
              onStop={() => {
                setPendingActionId(inst.id);
                action.mutate({ id: inst.id, action: "stop" }, { onSettled: () => setPendingActionId(null) });
              }}
              onRestart={() => {
                setPendingActionId(inst.id);
                action.mutate({ id: inst.id, action: "restart" }, { onSettled: () => setPendingActionId(null) });
              }}
              onUninstall={() => {
                if (confirm(`Uninstall ${inst.app_name}? This will remove all data.`)) {
                  uninstall.mutate(inst.id);
                }
              }}
              isPending={pendingActionId === inst.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface InstallationRowProps {
  installation: Installation;
  expanded: boolean;
  onToggleLogs: () => void;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  onUninstall: () => void;
  isPending: boolean;
}

function InstallationRow({
  installation: inst,
  expanded,
  onToggleLogs,
  onStart,
  onStop,
  onRestart,
  onUninstall,
  isPending,
}: InstallationRowProps) {
  const isRunning = inst.status === "running";
  const isStopped = inst.status === "stopped";
  const isTransitioning = inst.status === "installing" || inst.status === "uninstalling" || inst.status === "pending";
  const dateStr = new Date(inst.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Main row */}
        <div className="flex items-center gap-4 px-5 py-4">
          {/* App info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-semibold text-zinc-900 truncate">{inst.app_name}</h3>
              <StatusBadge status={inst.status} />
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
              <span>Installed {dateStr}</span>
              {inst.runtime_info && "gpu_uuids" in (inst.runtime_info as Record<string, unknown>) && (
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  GPU assigned
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {isPending && <Spinner size="sm" />}

            {/* Open link */}
            {isRunning && (
              <Button variant="ghost" size="icon" title="Open application" onClick={() => window.open(`/app/${inst.id}/`, "_blank")}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}

            {/* Logs toggle */}
            {(isRunning || isStopped) && (
              <Button
                variant={expanded ? "secondary" : "ghost"}
                size="icon"
                title="View logs"
                onClick={onToggleLogs}
              >
                <ScrollText className="h-4 w-4" />
              </Button>
            )}

            {/* Lifecycle controls */}
            {isRunning && (
              <>
                <Button variant="ghost" size="icon" title="Stop" onClick={onStop} disabled={isPending}>
                  <Square className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" title="Restart" onClick={onRestart} disabled={isPending}>
                  <RotateCw className="h-3.5 w-3.5" />
                </Button>
              </>
            )}

            {isStopped && (
              <Button variant="ghost" size="icon" title="Start" onClick={onStart} disabled={isPending}>
                <Play className="h-4 w-4 text-emerald-600" />
              </Button>
            )}

            {/* Uninstall */}
            {!isTransitioning && (
              <Button variant="ghost" size="icon" title="Uninstall" onClick={onUninstall} disabled={isPending} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Inline log viewer */}
        {expanded && (
          <div className="border-t border-zinc-200">
            <LogViewer installationId={inst.id} className="rounded-none border-0" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
