import { Link } from "react-router-dom";
import { useInstallations } from "@/hooks/useInstallations";
import { useGpuMetrics } from "@/hooks/useGpuMetrics";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Box, Monitor, Activity, ArrowRight, Store } from "lucide-react";

export function DashboardPage() {
  const { data: installationsData } = useInstallations();
  const { data: gpuData } = useGpuMetrics();

  const installations = installationsData?.items || [];
  const runningApps = installations.filter((i) => i.status === "running");
  const totalGpus = gpuData?.count || 0;
  const gpus = gpuData?.gpus || [];
  const avgUtil = gpus.length > 0 ? gpus.reduce((sum, g) => sum + g.utilization_gpu, 0) / gpus.length : 0;
  const avgTemp = gpus.length > 0 ? gpus.reduce((sum, g) => sum + g.temperature, 0) / gpus.length : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Overview of your DGX platform</p>
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
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Active GPUs</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">{totalGpus}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Monitor className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">GPU Utilization</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">{avgUtil.toFixed(0)}%</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
                <Activity className="h-5 w-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Avg Temperature</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">{avgTemp.toFixed(0)}C</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <Activity className="h-5 w-5 text-amber-600" />
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
            {runningApps.length === 0 ? (
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
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{inst.app_name}</p>
                      <p className="text-xs text-zinc-400">
                        Installed {new Date(inst.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={inst.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* GPU Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>GPU Overview</CardTitle>
              <Link to="/gpu">
                <Button variant="ghost" size="sm">
                  Details <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!gpuData || gpuData.gpus.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">No GPUs detected</p>
            ) : (
              <div className="space-y-3">
                {gpuData.gpus.map((gpu) => (
                  <div key={gpu.index} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-zinc-700">GPU {gpu.index}</span>
                      <span className="text-xs text-zinc-400">{gpu.name}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="flex justify-between text-[11px] text-zinc-400 mb-0.5">
                          <span>Util</span>
                          <span>{gpu.utilization_gpu.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-zinc-100">
                          <div
                            className="h-1.5 rounded-full bg-blue-500 transition-all"
                            style={{ width: `${gpu.utilization_gpu}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] text-zinc-400 mb-0.5">
                          <span>VRAM</span>
                          <span>{((gpu.vram_used_mb / gpu.vram_total_mb) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-zinc-100">
                          <div
                            className="h-1.5 rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${(gpu.vram_used_mb / gpu.vram_total_mb) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] text-zinc-400 mb-0.5">
                          <span>Temp</span>
                          <span>{gpu.temperature}C</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-zinc-100">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${Math.min((gpu.temperature / 100) * 100, 100)}%`,
                              backgroundColor: gpu.temperature > 80 ? "#ef4444" : gpu.temperature > 60 ? "#f59e0b" : "#22c55e",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
