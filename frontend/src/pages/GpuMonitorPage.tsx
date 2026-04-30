import { useGpuMetrics } from "@/hooks/useGpuMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBytes } from "@/lib/utils";
import { MonitorCpu, Thermometer, Zap, HardDrive } from "lucide-react";

export function GpuMonitorPage() {
  const { data, isLoading } = useGpuMetrics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900">GPU Monitor</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 rounded-xl border border-zinc-200 bg-zinc-50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.gpus.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900">GPU Monitor</h1>
        <EmptyState icon={<MonitorCpu className="h-6 w-6" />} title="No GPUs detected" description="Make sure NVIDIA drivers are installed" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">GPU Monitor</h1>
        <p className="text-sm text-zinc-500 mt-1">{data.count} GPU(s) detected — auto-refreshing every 10s</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.gpus.map((gpu) => {
          const vramPct = (gpu.vram_used_mb / gpu.vram_total_mb) * 100;
          const tempColor = gpu.temperature > 80 ? "text-red-600 bg-red-50" : gpu.temperature > 60 ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50";

          return (
            <Card key={gpu.index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>GPU {gpu.index}</CardTitle>
                  <Badge variant="secondary">{gpu.name}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Utilization bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-1.5 text-zinc-600">
                      <Zap className="h-3.5 w-3.5" />
                      GPU Utilization
                    </span>
                    <span className="font-mono font-medium text-zinc-900">{gpu.utilization_gpu.toFixed(0)}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-zinc-100">
                    <div
                      className="h-2.5 rounded-full bg-blue-500 transition-all duration-700"
                      style={{ width: `${gpu.utilization_gpu}%` }}
                    />
                  </div>
                </div>

                {/* VRAM bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-1.5 text-zinc-600">
                      <HardDrive className="h-3.5 w-3.5" />
                      VRAM
                    </span>
                    <span className="font-mono text-xs text-zinc-500">
                      {formatBytes(gpu.vram_used_mb)} / {formatBytes(gpu.vram_total_mb)}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-zinc-100">
                    <div
                      className="h-2.5 rounded-full bg-emerald-500 transition-all duration-700"
                      style={{ width: `${vramPct}%` }}
                    />
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className={`rounded-lg p-3 ${tempColor}`}>
                    <div className="flex items-center gap-1 text-xs opacity-70">
                      <Thermometer className="h-3 w-3" />
                      Temperature
                    </div>
                    <p className="mt-0.5 font-mono text-lg font-bold">{gpu.temperature}<span className="text-xs font-normal">C</span></p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-3">
                    <div className="text-xs text-zinc-400">Power Draw</div>
                    <p className="mt-0.5 font-mono text-lg font-bold text-zinc-900">{gpu.power_usage_w.toFixed(0)}<span className="text-xs font-normal text-zinc-500">W</span></p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-3">
                    <div className="text-xs text-zinc-400">Memory Controller</div>
                    <p className="mt-0.5 font-mono text-lg font-bold text-zinc-900">{gpu.utilization_memory.toFixed(0)}<span className="text-xs font-normal text-zinc-500">%</span></p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-3">
                    <div className="text-xs text-zinc-400">Free VRAM</div>
                    <p className="mt-0.5 font-mono text-lg font-bold text-zinc-900">{formatBytes(gpu.vram_free_mb)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
