import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApps } from "@/hooks/useApps";
import { useInstallApp, useInstallations } from "@/hooks/useInstallations";
import { useGpuMetrics } from "@/hooks/useGpuMetrics";
import { useLLMProviders } from "@/hooks/useLLMProviders";
import { useJobPolling } from "@/hooks/useJobPolling";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Dialog, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import { Progress } from "@/components/ui/Progress";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfigForm } from "@/components/config/ConfigForm";
import { APP_CATEGORIES } from "@/lib/constants";
import type { App, TemplateConfigField, TemplateConfig } from "@/lib/types";
import { getTemplateConfig } from "@/api/apps";
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
  Mic,
  Brain,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, typeof Cpu> = {
  llm: Zap,
  inference: Cpu,
  notebook: BookOpen,
  imaging: Image,
  data: Database,
  utility: Wrench,
  automation: Wrench,
  productivity: Mic,
};

const CATEGORY_COLORS: Record<string, string> = {
  llm: "bg-violet-50 text-violet-700 border-violet-200",
  inference: "bg-cyan-50 text-cyan-700 border-cyan-200",
  notebook: "bg-amber-50 text-amber-700 border-amber-200",
  imaging: "bg-pink-50 text-pink-700 border-pink-200",
  data: "bg-emerald-50 text-emerald-700 border-emerald-200",
  utility: "bg-zinc-50 text-zinc-700 border-zinc-200",
  automation: "bg-orange-50 text-orange-700 border-orange-200",
  productivity: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  gemini: "Gemini",
  anthropic: "Anthropic",
  ollama: "Ollama (Local)",
};

export function CatalogPage() {
  const [category, setCategory] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [gpuIndices, setGpuIndices] = useState<number[]>([0]);
  const [activeJobId, setActiveJobId] = useState<number | null>(null);
  const [templateConfigFields, setTemplateConfigFields] = useState<TemplateConfigField[]>([]);
  const [templateLlmConfig, setTemplateLlmConfig] = useState<TemplateConfig["llm"] | null>(null);
  const [templateGpuConfig, setTemplateGpuConfig] = useState<TemplateConfig["gpu"] | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, unknown>>({});
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");

  const { data, isLoading } = useApps({ category, search: search || undefined });
  const { data: gpuStatus } = useGpuMetrics();
  const { data: llmProviders } = useLLMProviders();
  const installApp = useInstallApp();
  const { data: installationsData } = useInstallations();
  const installedAppIds = new Set((installationsData?.items ?? []).map((i) => i.app_id));

  const jobQuery = useJobPolling(activeJobId, (job) => {
    if (job.status === "completed") {
      setTimeout(() => {
        setActiveJobId(null);
        setSelectedApp(null);
      }, 2000);
    }
  });

  // Resolve available models when provider changes
  const selectedProvider = llmProviders?.find((p) => p.id === selectedProviderId);
  const availableModels = selectedProvider?.models ?? [];

  useEffect(() => {
    if (availableModels.length > 0 && !selectedModel) {
      setSelectedModel(availableModels[0]);
    }
  }, [availableModels.length, selectedModel]);

  const handleInstall = () => {
    if (!selectedApp) return;
    const config = { gpu_indices: gpuIndices, ...configValues };
    installApp.mutate(
      {
        appId: selectedApp.id,
        config,
        llm_provider_id: selectedProviderId,
        llm_model: selectedModel || null,
      },
      { onSuccess: (res) => setActiveJobId(res.job_id) },
    );
  };

  const handleSelectApp = async (app: App) => {
    setSelectedApp(app);
    setGpuIndices([0]);
    setActiveJobId(null);
    setConfigValues({});
    setTemplateConfigFields([]);
    setTemplateLlmConfig(null);
    setTemplateGpuConfig(null);
    setSelectedProviderId(null);
    setSelectedModel("");
    try {
      const res = await getTemplateConfig(app.slug);
      setTemplateConfigFields(res.config ?? []);
      setTemplateLlmConfig(res.llm ?? null);
      setTemplateGpuConfig(res.gpu ?? null);

      // Auto-select default provider if template supports LLM
      if (res.llm && llmProviders) {
        const defaultProvider = llmProviders.find(
          (p) => p.is_default && p.enabled && res.llm!.supported_providers.includes(p.provider_type),
        );
        if (defaultProvider) {
          setSelectedProviderId(defaultProvider.id);
        }
      }
    } catch {
      // No config fields available for this app
    }
  };

  const toggleGpu = (index: number) => {
    setGpuIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const isInstalling = activeJobId !== null;
  const jobDone = jobQuery.data?.status === "completed";
  const jobFailed = jobQuery.data?.status === "failed";
  const gpuRequired = templateGpuConfig?.required ?? false;
  const hasGpus = (gpuStatus?.count ?? 0) > 0;

  // Filter LLM providers for this template
  const compatibleProviders = llmProviders?.filter(
    (p) => p.enabled && templateLlmConfig?.supported_providers?.includes(p.provider_type),
  ) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">App Catalog</h1>
        <p className="text-sm text-zinc-500 mt-1">Browse and install AI applications</p>
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
            const isInstalled = installedAppIds.has(app.id);

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
                    {isInstalled && (
                      <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        <CheckCircle2 className="h-3 w-3 mr-0.5" />
                        Installed
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  {isInstalled ? (
                    <Link to="/my-apps" className="block">
                      <Button variant="secondary" className="w-full" size="sm">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Installed — Manage
                      </Button>
                    </Link>
                  ) : (
                    <Button onClick={() => handleSelectApp(app)} className="w-full" size="sm">
                      <Download className="h-3.5 w-3.5" />
                      Install
                    </Button>
                  )}
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
            <>
              {/* GPU Assignment — only show if GPU detected or required */}
              {(hasGpus || gpuRequired) && (
                <div>
                  <label className="text-sm font-medium text-zinc-700">GPU Assignment</label>
                  <p className="mt-1 text-xs text-zinc-400">
                    {gpuRequired ? "This app requires a GPU" : "Select one or more GPUs for this application"}
                  </p>
                  <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-zinc-200 p-2">
                    {(gpuStatus?.gpus ?? []).map((gpu) => (
                      <label
                        key={gpu.index}
                        className={`flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-zinc-50 ${
                          gpuIndices.includes(gpu.index) ? "bg-zinc-100" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={gpuIndices.includes(gpu.index)}
                          onChange={() => toggleGpu(gpu.index)}
                          className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-zinc-900">GPU {gpu.index}</div>
                          <div className="text-[11px] text-zinc-400 truncate">{gpu.name}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[11px] text-zinc-500">
                            {gpu.utilization_gpu.toFixed(0)}% util
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {((gpu.vram_total_mb - gpu.vram_free_mb) / 1024).toFixed(1)}/{(gpu.vram_total_mb / 1024).toFixed(0)} GB
                          </div>
                        </div>
                      </label>
                    ))}
                    {!hasGpus && (
                      <p className="px-2 py-1.5 text-xs text-zinc-400">
                        {gpuRequired
                          ? "⚠️ This app requires a GPU but none was detected"
                          : "No GPUs detected — app will run in CPU mode"}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* LLM Provider Selection */}
              {templateLlmConfig && compatibleProviders.length > 0 && (
                <div className="border-t border-zinc-200 pt-4">
                  <label className="text-sm font-medium text-zinc-700">AI Model Provider</label>
                  <p className="mt-1 text-xs text-zinc-400">Connect this app to an AI model provider</p>

                  <select
                    value={selectedProviderId ?? ""}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : null;
                      setSelectedProviderId(val);
                      setSelectedModel("");
                    }}
                    className="mt-2 h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                  >
                    <option value="">No LLM provider</option>
                    {compatibleProviders.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({PROVIDER_LABELS[p.provider_type] || p.provider_type})
                      </option>
                    ))}
                  </select>

                  {selectedProviderId && availableModels.length > 0 && (
                    <div className="mt-2">
                      <label className="text-xs font-medium text-zinc-600">Model</label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="mt-1 h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                      >
                        {availableModels.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedProviderId && availableModels.length === 0 && (
                    <p className="mt-2 text-xs text-zinc-400">
                      No models loaded — test the provider connection first
                    </p>
                  )}
                </div>
              )}

              {templateLlmConfig && compatibleProviders.length === 0 && (
                <div className="border-t border-zinc-200 pt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <Brain className="h-4 w-4" />
                    <span className="font-medium">This app supports AI providers</span>
                  </div>
                  <p className="mt-1 text-xs text-amber-600">
                    Configure a compatible provider in the LLM Providers page first.
                    Supported: {templateLlmConfig.supported_providers.map((p) => PROVIDER_LABELS[p] || p).join(", ")}
                  </p>
                </div>
              )}

              {/* Template Config Fields */}
              {templateConfigFields.length > 0 && (
                <div className="border-t border-zinc-200 pt-4">
                  <label className="text-sm font-medium text-zinc-700">Configuration</label>
                  <div className="mt-2">
                    <ConfigForm
                      fields={templateConfigFields}
                      values={configValues}
                      onChange={setConfigValues}
                    />
                  </div>
                </div>
              )}
            </>
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
