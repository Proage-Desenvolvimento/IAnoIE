import { useState } from "react";
import { Link } from "react-router-dom";
import { useInstallations, useUninstallApp, useAppAction, useUpdateConfig } from "@/hooks/useInstallations";
import { useJobPolling } from "@/hooks/useJobPolling";
import { useInstallLogs } from "@/hooks/useInstallLogs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Progress } from "@/components/ui/Progress";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LogViewer } from "@/components/logs/LogViewer";
import { InstallLogs } from "@/components/logs/InstallLogs";
import { ConfigForm } from "@/components/config/ConfigForm";
import { Card, CardContent } from "@/components/ui/Card";
import { Dialog, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import { getTemplateConfig } from "@/api/apps";
import {
  Play,
  Square,
  RotateCw,
  Trash2,
  ExternalLink,
  ScrollText,
  Box,
  Settings,
  CheckCircle2,
  XCircle,
  Brain,
  Terminal,
} from "lucide-react";
import type { Installation, TemplateConfigField } from "@/lib/types";

export function MyAppsPage() {
  const { data, isLoading, isError, refetch } = useInstallations();
  const uninstall = useUninstallApp();
  const action = useAppAction();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);
  const [settingsInst, setSettingsInst] = useState<Installation | null>(null);
  const [configFields, setConfigFields] = useState<TemplateConfigField[]>([]);
  const [configValues, setConfigValues] = useState<Record<string, unknown>>({});
  const [configJobId, setConfigJobId] = useState<number | null>(null);
  const updateConfig = useUpdateConfig();

  const jobQuery = useJobPolling(configJobId, (job) => {
    if (job.status === "completed" || job.status === "failed") {
      setTimeout(() => {
        setConfigJobId(null);
        if (job.status === "completed") setSettingsInst(null);
      }, 2000);
    }
  });

  const toggleLogs = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleOpenSettings = async (inst: Installation) => {
    setSettingsInst(inst);
    setConfigJobId(null);
    setConfigValues(inst.config ?? {});
    setConfigFields([]);
    try {
      const res = await getTemplateConfig(inst.app_slug);
      setConfigFields(res.config ?? []);
    } catch {
      // No config fields for this app
    }
  };

  const handleSaveConfig = () => {
    if (!settingsInst) return;
    updateConfig.mutate(
      { id: settingsInst.id, config: configValues },
      {
        onSuccess: (res) => {
          setConfigJobId(res.job_id);
        },
      },
    );
  };

  const configJobDone = jobQuery.data?.status === "completed";
  const configJobFailed = jobQuery.data?.status === "failed";
  const isSaving = configJobId !== null;

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
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
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
              onSettings={() => handleOpenSettings(inst)}
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

      {/* Settings / Reconfigure Dialog */}
      <Dialog
        open={!!settingsInst}
        onClose={() => {
          if (!isSaving) {
            setSettingsInst(null);
            setConfigJobId(null);
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Settings — {settingsInst?.app_name}</DialogTitle>
          <DialogClose
            onClose={() => {
              if (!isSaving) {
                setSettingsInst(null);
                setConfigJobId(null);
              }
            }}
          />
        </DialogHeader>
        <DialogBody className="space-y-4">
          {!isSaving ? (
            configFields.length > 0 ? (
              <ConfigForm
                fields={configFields}
                values={configValues}
                onChange={setConfigValues}
              />
            ) : (
              <p className="text-sm text-zinc-500">No configurable options for this app.</p>
            )
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600">
                  {configJobDone ? "Configuration updated" : configJobFailed ? "Update failed" : "Applying new configuration..."}
                </span>
              </div>
              {configJobDone && (
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Containers recreated with new settings</span>
                </div>
              )}
              {configJobFailed && (
                <>
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Failed to apply configuration</span>
                  </div>
                  {jobQuery.data?.error && (
                    <p className="text-xs text-red-600 bg-red-50 rounded-lg p-2">{jobQuery.data.error}</p>
                  )}
                </>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          {isSaving ? (
            <Button
              variant="outline"
              onClick={() => {
                setSettingsInst(null);
                setConfigJobId(null);
              }}
            >
              {configJobDone || configJobFailed ? "Close" : "Hide"}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setSettingsInst(null)}>Cancel</Button>
              <Button
                onClick={handleSaveConfig}
                disabled={configFields.length === 0 || updateConfig.isPending}
              >
                {updateConfig.isPending ? <><Spinner size="sm" /> Saving...</> : <><Settings className="h-3.5 w-3.5" /> Apply Changes</>}
              </Button>
            </>
          )}
        </DialogFooter>
      </Dialog>
    </div>
  );
}

interface InstallationRowProps {
  installation: Installation;
  expanded: boolean;
  onToggleLogs: () => void;
  onSettings: () => void;
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
  onSettings,
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
              {inst.runtime_info && Array.isArray((inst.runtime_info as Record<string, unknown>).gpu_uuids) && ((inst.runtime_info as Record<string, unknown[]>).gpu_uuids as unknown[]).length > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    GPU assigned
                  </span>
              )}
              {inst.llm_provider_name && (
                <span className="flex items-center gap-1">
                  <Brain className="h-3 w-3 text-purple-400" />
                  <span className="text-purple-500">{inst.llm_provider_name}</span>
                  {inst.llm_model && (
                    <span className="text-zinc-400">/ {inst.llm_model}</span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {isPending && <Spinner size="sm" />}

            {/* Open link */}
            {isRunning && (
              <Button variant="ghost" size="icon" title="Open application" onClick={() => inst.access?.url && window.open(inst.access.url, "_blank")}>
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

            {/* Settings — show when app has config or is running/stopped */}
            {(isRunning || isStopped) && (
              <Button
                variant="ghost"
                size="icon"
                title="Settings"
                onClick={onSettings}
              >
                <Settings className="h-4 w-4" />
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

        {/* Live progress + install/uninstall logs while a job is running */}
        {isTransitioning && <InstallProgressPanel inst={inst} />}

        {/* Access info (URL + credentials declared in the template) */}
        {inst.access && (inst.access.credentials.length > 0 || inst.access.note || inst.access.url) && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-zinc-100 bg-zinc-50/60 px-5 py-2.5 text-xs">
            <span className="font-medium text-zinc-500">Access</span>
            {inst.access.url && (
              <a
                href={inst.access.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-zinc-700 hover:text-zinc-900"
              >
                <ExternalLink className="h-3 w-3" />
                Open app
              </a>
            )}
            {inst.access.credentials.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="text-zinc-400">{c.label}:</span>
                <code className="rounded bg-zinc-200/70 px-1.5 py-0.5 font-mono text-zinc-700">{c.value}</code>
              </span>
            ))}
            {inst.access.note && <span className="text-zinc-400">{inst.access.note}</span>}
          </div>
        )}

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

function InstallProgressPanel({ inst }: { inst: Installation }) {
  const { currentStatus, logs } = useInstallLogs(inst.id);
  const [showLogs, setShowLogs] = useState(true);

  const job = inst.active_job ?? null;
  const progress = job?.progress ?? 0;
  const done = job?.status === "completed";
  const failed = job?.status === "failed";
  const isUninstall = inst.status === "uninstalling";

  return (
    <div className="space-y-3 border-t border-zinc-200 px-5 py-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-600">
            {failed
              ? isUninstall
                ? "Uninstall failed"
                : "Install failed"
              : done
                ? "Ready"
                : isUninstall
                  ? "Uninstalling…"
                  : "Installing…"}
          </span>
          <span className="font-mono text-zinc-500">{(progress * 100).toFixed(0)}%</span>
        </div>
        <Progress
          value={progress}
          indicatorClassName={done ? "bg-emerald-500" : failed ? "bg-red-500" : undefined}
        />
        {!done && !failed && (
          <p className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Spinner size="sm" />
            <span className="truncate">{currentStatus?.message ?? "Preparing…"}</span>
          </p>
        )}
        {job?.error && (
          <p className="rounded-lg bg-red-50 p-2 text-xs text-red-600">{job.error}</p>
        )}
      </div>

      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLogs((v) => !v)}
          className="h-7 px-2 text-zinc-500 hover:text-zinc-700"
        >
          <Terminal className="h-3.5 w-3.5" />
          {showLogs ? "Hide logs" : "View logs"}
        </Button>
        {showLogs && <InstallLogs logs={logs} />}
      </div>
    </div>
  );
}
