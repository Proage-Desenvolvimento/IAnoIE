import { useParams, Link, useNavigate } from "react-router-dom";
import { useInstallations, useAppAction, useUninstallApp } from "@/hooks/useInstallations";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { LogViewer } from "@/components/logs/LogViewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  ArrowLeft,
  Play,
  Square,
  RotateCw,
  Trash2,
  ExternalLink,
  Box,
  Clock,
  Cpu,
} from "lucide-react";

export function AppDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const installationId = Number(id);
  const { data, isLoading } = useInstallations();
  const action = useAppAction();
  const uninstall = useUninstallApp();

  const inst = data?.items.find((i) => i.id === installationId);

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (!inst) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">Installation not found</p>
        <Link to="/my-apps"><Button variant="outline" size="sm" className="mt-4">Back to apps</Button></Link>
      </div>
    );
  }

  const isRunning = inst.status === "running";
  const isStopped = inst.status === "stopped";
  const dateStr = new Date(inst.created_at).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-4">
        <Link to="/my-apps">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-zinc-900">{inst.app_name}</h1>
            <StatusBadge status={inst.status} />
          </div>
          <p className="text-sm text-zinc-500 mt-0.5">{inst.app_slug}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {isRunning && (
            <>
              <Button variant="outline" size="sm" onClick={() => window.open(`/app/${inst.id}/`, "_blank")}>
                <ExternalLink className="h-3.5 w-3.5" /> Open
              </Button>
              <Button variant="outline" size="sm" onClick={() => action.mutate({ id: inst.id, action: "stop" })}>
                <Square className="h-3.5 w-3.5" /> Stop
              </Button>
              <Button variant="outline" size="sm" onClick={() => action.mutate({ id: inst.id, action: "restart" })}>
                <RotateCw className="h-3.5 w-3.5" /> Restart
              </Button>
            </>
          )}
          {isStopped && (
            <Button size="sm" onClick={() => action.mutate({ id: inst.id, action: "start" })}>
              <Play className="h-3.5 w-3.5" /> Start
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm(`Uninstall ${inst.app_name}?`)) {
                uninstall.mutate(inst.id, { onSuccess: () => navigate("/my-apps") });
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" /> Uninstall
          </Button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Box className="h-4 w-4 text-zinc-400" />
            <div>
              <p className="text-xs text-zinc-400">Container</p>
              <p className="text-sm font-mono text-zinc-700">{inst.container_id ? inst.container_id.slice(0, 12) : "N/A"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-4 w-4 text-zinc-400" />
            <div>
              <p className="text-xs text-zinc-400">Installed</p>
              <p className="text-sm text-zinc-700">{dateStr}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Cpu className="h-4 w-4 text-zinc-400" />
            <div>
              <p className="text-xs text-zinc-400">GPU</p>
              <p className="text-sm text-zinc-700">
                {inst.runtime_info && (inst.runtime_info as Record<string, unknown>).gpu_uuids
                  ? "Assigned"
                  : "None"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Application Logs</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-0">
          {(isRunning || isStopped) ? (
            <LogViewer installationId={inst.id} className="rounded-none border-0" />
          ) : (
            <p className="text-sm text-zinc-500 p-4">Logs available when app is running or stopped.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
