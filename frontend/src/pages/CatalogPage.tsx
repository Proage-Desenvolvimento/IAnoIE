import { useState } from "react";
import { useApps } from "@/hooks/useApps";
import { useInstallApp } from "@/hooks/useInstallations";
import { useJobPolling } from "@/hooks/useJobPolling";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Dialog, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import { Progress } from "@/components/ui/Progress";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { APP_CATEGORIES } from "@/lib/constants";
import type { App } from "@/lib/types";
import {
  Search,
  Download,
  Cpu,
  Zap,
  BookOpen,
  Image,
  Database,
  Wrench,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, typeof Cpu> = {
  llm: Zap,
  inference: Cpu,
  notebook: BookOpen,
  imaging: Image,
  data: Database,
  utility: Wrench,
};

const CATEGORY_COLORS: Record<string, string> = {
  llm: "bg-violet-50 text-violet-700 border-violet-200",
  inference: "bg-cyan-50 text-cyan-700 border-cyan-200",
  notebook: "bg-amber-50 text-amber-700 border-amber-200",
  imaging: "bg-pink-50 text-pink-700 border-pink-200",
  data: "bg-emerald-50 text-emerald-700 border-emerald-200",
  utility: "bg-zinc-50 text-zinc-700 border-zinc-200",
};

export function CatalogPage() {
  const [category, setCategory] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [gpuIndex, setGpuIndex] = useState(0);
  const [activeJobId, setActiveJobId] = useState<number | null>(null);

  const { data, isLoading } = useApps({ category, search: search || undefined });
  const installApp = useInstallApp();

  const jobQuery = useJobPolling(activeJobId, (job) => {
    if (job.status === "completed") {
      setTimeout(() => {
        setActiveJobId(null);
        setSelectedApp(null);
      }, 2000);
    }
  });

  const handleInstall = () => {
    if (!selectedApp) return;
    installApp.mutate(
      { appId: selectedApp.id, config: { gpu_index: gpuIndex } },
      { onSuccess: (res) => setActiveJobId(res.job_id) },
    );
  };

  const isInstalling = activeJobId !== null;
  const jobDone = jobQuery.data?.status === "completed";
  const jobFailed = jobQuery.data?.status === "failed";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">App Catalog</h1>
        <p className="text-sm text-zinc-500 mt-1">Browse and install AI applications on your DGX</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-transparent"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setCategory(undefined)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              !category ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            All
          </button>
          {APP_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value === category ? undefined : cat.value)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                cat.value === category ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* App Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl border border-zinc-200 bg-zinc-50 animate-pulse" />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <EmptyState title="No apps found" description="Try adjusting your search or filters" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((app) => {
            const Icon = CATEGORY_ICONS[app.category] || Wrench;
            const colorClass = CATEGORY_COLORS[app.category] || "";
            const gpuReq = app.gpu_requirements as Record<string, unknown> | null;
            const needsGpu = gpuReq?.gpu_required;

            return (
              <Card key={app.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle>{app.name}</CardTitle>
                      <CardDescription>v{app.version}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-zinc-600 line-clamp-2">{app.description}</p>
                  <div className="mt-3 flex gap-1.5">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${colorClass}`}>
                      {app.category}
                    </span>
                    {needsGpu ? (
                      <Badge variant="info">
                        <Cpu className="h-3 w-3 mr-0.5" />
                        GPU
                      </Badge>
                    ) : null}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => { setSelectedApp(app); setGpuIndex(0); setActiveJobId(null); }} className="w-full" size="sm">
                    <Download className="h-3.5 w-3.5" />
                    Install
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Install Dialog */}
      <Dialog open={!!selectedApp} onClose={() => { if (!isInstalling) { setSelectedApp(null); setActiveJobId(null); } }}>
        <DialogHeader>
          <DialogTitle>Install {selectedApp?.name}</DialogTitle>
          <DialogClose onClose={() => { if (!isInstalling) { setSelectedApp(null); setActiveJobId(null); } }} />
        </DialogHeader>
        <DialogBody className="space-y-4">
          <p className="text-sm text-zinc-500">{selectedApp?.description}</p>

          {!isInstalling ? (
            <div>
              <label className="text-sm font-medium text-zinc-700">GPU Assignment</label>
              <select
                value={gpuIndex}
                onChange={(e) => setGpuIndex(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
              >
                {Array.from({ length: 8 }, (_, i) => (
                  <option key={i} value={i}>GPU {i}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-zinc-400">Select which GPU to use for this application</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600">
                    {jobDone ? "Installed successfully" : jobFailed ? "Installation failed" : "Installing..."}
                  </span>
                  <span className="font-mono text-zinc-500">
                    {jobQuery.data ? `${(jobQuery.data.progress * 100).toFixed(0)}%` : "0%"}
                  </span>
                </div>
                <Progress
                  value={jobQuery.data?.progress ?? 0}
                  indicatorClassName={jobDone ? "bg-emerald-500" : jobFailed ? "bg-red-500" : undefined}
                />
                {jobQuery.data?.error && (
                  <p className="text-xs text-red-600 bg-red-50 rounded-lg p-2">{jobQuery.data.error}</p>
                )}
              </div>
              {jobDone && (
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Ready to use</span>
                </div>
              )}
              {jobFailed && (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Installation failed</span>
                </div>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          {isInstalling ? (
            <Button variant="outline" onClick={() => { setSelectedApp(null); setActiveJobId(null); }}>
              {jobDone || jobFailed ? "Close" : "Hide"}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setSelectedApp(null)}>Cancel</Button>
              <Button onClick={handleInstall} disabled={installApp.isPending}>
                {installApp.isPending ? <><Spinner size="sm" /> Installing...</> : <><Download className="h-3.5 w-3.5" /> Install</>}
              </Button>
            </>
          )}
        </DialogFooter>
      </Dialog>
    </div>
  );
}
