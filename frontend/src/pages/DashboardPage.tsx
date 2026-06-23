import { Link } from "react-router-dom";
import { useInstallations } from "@/hooks/useInstallations";
import { useSystemMetrics } from "@/hooks/useSystemMetrics";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { PartnerLogo } from "@/components/layout/PartnerLogo";
import { formatBytes } from "@/lib/utils";
import {
  Box,
  ArrowRight,
  Store,
  Cpu,
  MemoryStick,
  HardDrive,
  Brain,
} from "lucide-react";

export function DashboardPage() {
  const { data: installationsData, isError: installationsError, refetch: refetchInstallations } = useInstallations();
  const { data: sysMetrics, isError: sysMetricsError, refetch: refetchSysMetrics } = useSystemMetrics();

  const installations = installationsData?.items || [];
  const runningApps = installations.filter((i) => i.status === "running");
  const hasGpus = (sysMetrics?.gpus?.length ?? 0) > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Overview of your platform</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Running Apps</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">{runningApps.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <Box className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">CPU Usage</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">{sysMetrics?.cpu_percent.toFixed(0) ?? 0}%</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Cpu className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">RAM Usage</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">{sysMetrics?.memory_percent.toFixed(0) ?? 0}%</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
                <MemoryStick className="h-5 w-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Disk Usage</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">{sysMetrics?.disk_percent.toFixed(0) ?? 0}%</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <HardDrive className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Running Apps */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Running Applications</CardTitle>
              <Link to="/my-apps">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {installationsError ? (
              <ErrorState
                title="Couldn’t load apps"
                description="Your installed applications could not be loaded."
                onRetry={() => refetchInstallations()}
              />
            ) : runningApps.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-zinc-500">No apps running</p>
                <Link to="/catalog">
                  <Button variant="outline" size="sm" className="mt-3">
                    <Store className="h-3.5 w-3.5" />
                    Browse Catalog
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {runningApps.map((inst) => (
                  <div key={inst.id} className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/50 px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{inst.app_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-zinc-400">
                            {new Date(inst.created_at).toLocaleDateString()}
                          </p>
                          {inst.llm_provider_name && (
                            <span className="flex items-center gap-1 text-xs text-purple-500">
                              <Brain className="h-3 w-3" />
                              {inst.llm_provider_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={inst.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Resources */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>System Resources</CardTitle>
              <Link to="/system">
                <Button variant="ghost" size="sm">
                  Details <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {sysMetrics ? (
              <div className="space-y-3">
                {/* CPU */}
                <ResourceBar
                  label="CPU"
                  value={sysMetrics.cpu_percent}
                  detail={`${sysMetrics.cpu_count} cores`}
                  color="bg-blue-500"
                />
                {/* RAM */}
                <ResourceBar
                  label="RAM"
                  value={sysMetrics.memory_percent}
                  detail={`${formatBytes(sysMetrics.memory_used)} / ${formatBytes(sysMetrics.memory_total)}`}
                  color="bg-violet-500"
                />
                {/* Disk */}
                <ResourceBar
                  label="Disk"
                  value={sysMetrics.disk_percent}
                  detail={`${formatBytes(sysMetrics.disk_used)} / ${formatBytes(sysMetrics.disk_total)}`}
                  color="bg-amber-500"
                />

                {/* GPU section — only if detected */}
                {hasGpus && sysMetrics.gpus!.map((gpu, i) => (
                  <div key={i} className="pt-2 border-t border-zinc-100">
                    <ResourceBar
                      label={`GPU ${i}`}
                      value={gpu.utilization_gpu}
                      detail={`${(gpu.vram_used_mb / 1024).toFixed(1)}/${(gpu.vram_total_mb / 1024).toFixed(0)} GB — ${gpu.temperature}°C`}
                      color="bg-emerald-500"
                    />
                  </div>
                ))}
              </div>
            ) : sysMetricsError ? (
              <ErrorState
                title="Couldn’t load metrics"
                description="System metrics are unavailable right now."
                onRetry={() => refetchSysMetrics()}
              />
            ) : (
              <p className="text-sm text-zinc-500 text-center py-8">Loading system metrics...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Partner / Supporter */}
      <Card>
        <CardContent className="px-5 py-6">
          <PartnerLogo imgClassName="h-20 w-auto object-contain" />
        </CardContent>
      </Card>
    </div>
  );
}

function ResourceBar({ label, value, detail, color }: { label: string; value: number; detail: string; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-700">{label}</span>
        <span className="text-xs text-zinc-400">{detail}</span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-zinc-100">
          <div
            className={`h-1.5 rounded-full transition-all ${color}`}
            style={{ width: `${Math.min(value, 100)}%` }}
          />
        </div>
        <span className="text-xs font-mono text-zinc-600 w-10 text-right">{value.toFixed(0)}%</span>
      </div>
    </div>
  );
}
