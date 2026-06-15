import { useSystemMetrics, useSystemMetricsHistory } from "@/hooks/useSystemMetrics";
import { useGpuMetrics } from "@/hooks/useGpuMetrics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { formatBytes } from "@/lib/utils";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  Thermometer,
  Zap,
  Activity,
} from "lucide-react";

function GaugeBar({ value, max = 100, label, color }: { value: number; max?: number; label: string; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-zinc-600">{label}</span>
        <span className="font-mono text-zinc-900 font-medium">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ResourceCard({
  icon: Icon,
  title,
  value,
  subtitle,
  children,
}: {
  icon: typeof Cpu;
  title: string;
  value: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-zinc-400" />
          <CardTitle className="text-sm">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-zinc-900">{value}</div>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
        {children}
      </CardContent>
    </Card>
  );
}

function GpuCard({ gpu }: { gpu: { index: number; name: string; utilization_gpu: number; vram_used_mb: number; vram_total_mb: number; temperature: number; power_usage_w: number } }) {
  const tempColor = gpu.temperature > 80 ? "text-red-500" : gpu.temperature > 60 ? "text-amber-500" : "text-emerald-500";
  const vramPct = gpu.vram_total_mb > 0 ? (gpu.vram_used_mb / gpu.vram_total_mb) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">GPU {gpu.index}</CardTitle>
          <span className="text-xs text-zinc-400 font-mono">{gpu.name}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <GaugeBar value={gpu.utilization_gpu} label="Utilization" color="bg-violet-500" />
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-zinc-600">VRAM</span>
            <span className="font-mono text-zinc-900">
              {(gpu.vram_used_mb / 1024).toFixed(1)}/{(gpu.vram_total_mb / 1024).toFixed(0)} GB
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${vramPct}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-zinc-500">
            <Thermometer className="h-3 w-3" />
            Temperature
          </span>
          <span className={`font-mono font-medium ${tempColor}`}>{gpu.temperature}°C</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-zinc-500">
            <Zap className="h-3 w-3" />
            Power
          </span>
          <span className="font-mono text-zinc-700">{gpu.power_usage_w.toFixed(1)}W</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function SystemMonitorPage() {
  const { data: metrics, isLoading } = useSystemMetrics();
  const { data: gpuStatus } = useGpuMetrics();
  const { data: history } = useSystemMetricsHistory(24);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const memUsedGB = metrics ? formatBytes(metrics.memory_used) : "0";
  const memTotalGB = metrics ? formatBytes(metrics.memory_total) : "0";
  const diskUsedGB = metrics ? formatBytes(metrics.disk_used) : "0";
  const diskTotalGB = metrics ? formatBytes(metrics.disk_total) : "0";
  const netSentMB = metrics ? (metrics.net_bytes_sent / (1024 * 1024)).toFixed(1) : "0";
  const netRecvMB = metrics ? (metrics.net_bytes_recv / (1024 * 1024)).toFixed(1) : "0";
  const hasGpus = (gpuStatus?.count ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">System Monitor</h1>
        <p className="text-sm text-zinc-500 mt-1">Real-time system resource monitoring</p>
      </div>

      {/* Resource cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ResourceCard icon={Cpu} title="CPU" value={`${metrics?.cpu_percent.toFixed(1) ?? 0}%`} subtitle={`${metrics?.cpu_count ?? 0} cores`}>
          <div className="mt-3">
            <GaugeBar value={metrics?.cpu_percent ?? 0} label="" color={metrics && metrics.cpu_percent > 80 ? "bg-red-500" : metrics && metrics.cpu_percent > 60 ? "bg-amber-500" : "bg-emerald-500"} />
          </div>
        </ResourceCard>

        <ResourceCard icon={MemoryStick} title="Memory" value={memUsedGB} subtitle={`of ${memTotalGB} total`}>
          <div className="mt-3">
            <GaugeBar value={metrics?.memory_percent ?? 0} label="" color={metrics && metrics.memory_percent > 85 ? "bg-red-500" : metrics && metrics.memory_percent > 70 ? "bg-amber-500" : "bg-blue-500"} />
          </div>
        </ResourceCard>

        <ResourceCard icon={HardDrive} title="Disk" value={diskUsedGB} subtitle={`of ${diskTotalGB} total`}>
          <div className="mt-3">
            <GaugeBar value={metrics?.disk_percent ?? 0} label="" color={metrics && metrics.disk_percent > 90 ? "bg-red-500" : metrics && metrics.disk_percent > 75 ? "bg-amber-500" : "bg-violet-500"} />
          </div>
        </ResourceCard>

        <ResourceCard icon={Wifi} title="Network I/O" value={`↑ ${netSentMB} MB`} subtitle={`↓ ${netRecvMB} MB transferred`}>
        </ResourceCard>
      </div>

      {/* History chart (simple text-based until recharts is wired) */}
      {history && history.length > 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-zinc-400" />
              <CardTitle className="text-sm">24-Hour History</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xs text-zinc-500 mb-1">CPU Avg</div>
                <div className="text-lg font-bold text-zinc-900">
                  {(history.reduce((a, b) => a + b.cpu_percent, 0) / history.length).toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-zinc-500 mb-1">RAM Avg</div>
                <div className="text-lg font-bold text-zinc-900">
                  {(history.reduce((a, b) => a + b.memory_percent, 0) / history.length).toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-zinc-500 mb-1">Disk Avg</div>
                <div className="text-lg font-bold text-zinc-900">
                  {(history.reduce((a, b) => a + b.disk_percent, 0) / history.length).toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GPU section — only shown if GPUs detected */}
      {hasGpus && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900">GPU</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {gpuStatus?.gpus.map((gpu) => (
              <GpuCard key={gpu.index} gpu={gpu} />
            ))}
          </div>
        </div>
      )}

      {!hasGpus && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-zinc-400">
              <Cpu className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No GPU detected on this system</p>
              <p className="text-xs mt-1">GPU metrics will appear here when available</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
