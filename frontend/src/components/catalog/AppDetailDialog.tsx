import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Cpu,
  CheckCircle2,
  XCircle,
  Brain,
  Terminal,
  Check,
  Sparkles,
  Github,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogBody,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Spinner } from "@/components/ui/Spinner";
import { ConfigForm } from "@/components/config/ConfigForm";
import { InstallLogs } from "@/components/logs/InstallLogs";
import { AppMedia } from "./AppMedia";
import { getCategoryColor, getCategoryIcon, PROVIDER_LABELS } from "./constants";
import { useLanguage } from "@/i18n/LanguageContext";
import { useGpuMetrics } from "@/hooks/useGpuMetrics";
import { useLLMProviders } from "@/hooks/useLLMProviders";
import { useInstallApp } from "@/hooks/useInstallations";
import { useJobPolling } from "@/hooks/useJobPolling";
import { useInstallLogs } from "@/hooks/useInstallLogs";
import { getTemplateConfig } from "@/api/apps";
import type { App, TemplateConfigField, TemplateConfig } from "@/lib/types";
import type { AppContent } from "@/content/apps";

interface AppDetailDialogProps {
  app: App | null;
  content: AppContent | undefined;
  isInstalled: boolean;
  onClose: () => void;
}

export function AppDetailDialog({ app, content, isInstalled, onClose }: AppDetailDialogProps) {
  const { lang, t } = useLanguage();

  const [gpuIndices, setGpuIndices] = useState<number[]>([0]);
  const [activeJobId, setActiveJobId] = useState<number | null>(null);
  const [activeInstallationId, setActiveInstallationId] = useState<number | null>(null);
  const [showInstallLogs, setShowInstallLogs] = useState(false);
  const [templateConfigFields, setTemplateConfigFields] = useState<TemplateConfigField[]>([]);
  const [templateLlmConfig, setTemplateLlmConfig] = useState<TemplateConfig["llm"] | null>(null);
  const [templateGpuConfig, setTemplateGpuConfig] = useState<TemplateConfig["gpu"] | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, unknown>>({});
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");

  const { data: gpuStatus } = useGpuMetrics();
  const { data: llmProviders } = useLLMProviders();
  const installApp = useInstallApp();

  const isInstalling = activeJobId !== null;

  const jobQuery = useJobPolling(activeJobId, () => {
    // Auto-fechar 2s após concluir, como no fluxo original.
    window.setTimeout(() => onClose(), 2000);
  });

  const jobDone = jobQuery.data?.status === "completed";
  const jobFailed = jobQuery.data?.status === "failed";
  const jobTerminal = jobDone || jobFailed;
  const closeDisabled = isInstalling && !jobTerminal;

  const { logs: installLogLines, currentStatus } = useInstallLogs(
    isInstalling ? activeInstallationId : null,
  );

  const selectedProvider = llmProviders?.find((p) => p.id === selectedProviderId);
  const availableModels = selectedProvider?.models ?? [];

  const gpuRequired = templateGpuConfig?.required ?? false;
  const hasGpus = (gpuStatus?.count ?? 0) > 0;
  const compatibleProviders =
    llmProviders?.filter(
      (p) => p.enabled && templateLlmConfig?.supported_providers?.includes(p.provider_type),
    ) ?? [];

  // (Re)inicializa estado e carrega config do template quando o app muda.
  useEffect(() => {
    if (!app) return;
    let cancelled = false;
    setGpuIndices([0]);
    setActiveJobId(null);
    setActiveInstallationId(null);
    setShowInstallLogs(false);
    setConfigValues({});
    setTemplateConfigFields([]);
    setTemplateLlmConfig(null);
    setTemplateGpuConfig(null);
    setSelectedProviderId(null);
    setSelectedModel("");
    (async () => {
      try {
        const res = await getTemplateConfig(app.slug);
        if (cancelled) return;
        setTemplateConfigFields(res.config ?? []);
        setTemplateLlmConfig(res.llm ?? null);
        setTemplateGpuConfig(res.gpu ?? null);
      } catch {
        // Sem campos de config para este app.
      }
    })();
    return () => {
      cancelled = true;
    };
    // Roda apenas na troca de app.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app?.id]);

  // Auto-seleciona o provedor padrão quando os providers carregam.
  useEffect(() => {
    if (templateLlmConfig && llmProviders && selectedProviderId === null) {
      const def = llmProviders.find(
        (p) =>
          p.is_default &&
          p.enabled &&
          templateLlmConfig.supported_providers.includes(p.provider_type),
      );
      if (def) setSelectedProviderId(def.id);
    }
  }, [templateLlmConfig, llmProviders, selectedProviderId]);

  // Auto-seleciona o primeiro modelo disponível.
  useEffect(() => {
    if (availableModels.length > 0 && !selectedModel) {
      setSelectedModel(availableModels[0]);
    }
  }, [availableModels.length, selectedModel]);

  if (!app) return null;

  const loc = content ? content[lang] : undefined;
  const tagline = loc?.tagline ?? app.description;
  const description = loc?.description ?? app.description;
  const benefits = loc?.benefits ?? [];
  const useCases = loc?.useCases ?? [];

  const Icon = getCategoryIcon(app.category);
  const colorClass = getCategoryColor(app.category);
  const categoryLabel = t(`cat.${app.category}`);

  const gpuReq = app.gpu_requirements as Record<string, unknown> | null;
  const minVram = gpuReq?.min_vram_gb as number | undefined;

  const toggleGpu = (index: number) => {
    setGpuIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleInstall = () => {
    const config = { gpu_indices: gpuIndices, ...configValues };
    installApp.mutate(
      {
        appId: app.id,
        config,
        llm_provider_id: selectedProviderId,
        llm_model: selectedModel || null,
      },
      {
        onSuccess: (res) => {
          setActiveJobId(res.job_id);
          setActiveInstallationId(res.installation_id);
          setShowInstallLogs(false);
        },
      },
    );
  };

  return (
    <Dialog
      open={!!app}
      onClose={() => {
        if (!closeDisabled) onClose();
      }}
      panelClassName="max-w-2xl"
    >
      <DialogHeader>
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <DialogTitle>{app.name}</DialogTitle>
              {content?.repo_url && (
                <a
                  href={content.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700"
                >
                  <Github className="h-3 w-3" />
                  GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <p className="mt-0.5 text-xs text-zinc-400">v{app.version} · {categoryLabel}</p>
          </div>
        </div>
        <DialogClose
          onClose={() => {
            if (!closeDisabled) onClose();
          }}
        />
      </DialogHeader>

      <DialogBody className="max-h-[72vh] space-y-5 overflow-y-auto">
        {/* Mídia */}
        <AppMedia content={content} category={app.category} name={app.name} variant="detail" />

        {/* Apresentação */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-900">{tagline}</p>
          <p className="text-sm text-zinc-600">{description}</p>
        </div>

        {/* Benefícios */}
        {benefits.length > 0 && (
          <section className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <Sparkles className="h-3.5 w-3.5" />
              {t("detail.benefits")}
            </h4>
            <ul className="space-y-1.5">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-zinc-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Casos de uso */}
        {useCases.length > 0 && (
          <section className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {t("detail.useCases")}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {useCases.map((u) => (
                <span
                  key={u}
                  className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-600"
                >
                  {u}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Requisitos */}
        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t("detail.requirements")}
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${
                gpuRequired
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {gpuRequired ? <Cpu className="h-3 w-3" /> : <Check className="h-3 w-3" />}
              {gpuRequired ? t("req.gpuRequired") : t("req.noGpu")}
            </span>
            {gpuRequired && minVram ? (
              <span className="text-xs text-zinc-500">≥ {String(minVram)} GB VRAM</span>
            ) : null}
          </div>
        </section>

        {/* Já instalado */}
        {isInstalled && !isInstalling && (
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">{t("card.installed")}</span>
            </div>
            <Link to="/my-apps">
              <Button variant="secondary" size="sm">{t("card.manage")}</Button>
            </Link>
          </div>
        )}

        {/* Instalação — controles (configurar) vs progresso */}
        {!isInstalled && (
          isInstalling ? (
            <div className="space-y-3 border-t border-zinc-200 pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600">
                    {jobDone ? t("progress.done") : jobFailed ? t("progress.failed") : t("progress.installing")}
                  </span>
                  <span className="font-mono text-zinc-500">
                    {jobQuery.data ? `${(jobQuery.data.progress * 100).toFixed(0)}%` : "0%"}
                  </span>
                </div>
                <Progress
                  value={jobQuery.data?.progress ?? 0}
                  indicatorClassName={jobDone ? "bg-emerald-500" : jobFailed ? "bg-red-500" : undefined}
                />
                {!jobDone && !jobFailed && (
                  <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Spinner size="sm" />
                    <span className="truncate">{currentStatus?.message ?? t("progress.preparing")}</span>
                  </p>
                )}
                {jobQuery.data?.error && (
                  <p className="rounded-lg bg-red-50 p-2 text-xs text-red-600">{jobQuery.data.error}</p>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInstallLogs((v) => !v)}
                  className="h-7 px-2 text-zinc-500 hover:text-zinc-700"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  {showInstallLogs ? t("progress.hideLogs") : t("progress.viewLogs")}
                </Button>
                {showInstallLogs && <InstallLogs logs={installLogLines} />}
              </div>
              {jobDone && (
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">{t("progress.ready")}</span>
                </div>
              )}
              {jobFailed && (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">{t("progress.failed")}</span>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Atribuição de GPU */}
              {(hasGpus || gpuRequired) && (
                <div className="border-t border-zinc-200 pt-4">
                  <label className="text-sm font-medium text-zinc-700">{t("install.gpuAssignment")}</label>
                  <p className="mt-1 text-xs text-zinc-400">
                    {gpuRequired ? t("install.gpuRequiredHint") : t("install.gpuSelectHint")}
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
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-zinc-900">{t("install.gpuLabel", { index: gpu.index })}</div>
                          <div className="truncate text-[11px] text-zinc-400">{gpu.name}</div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-[11px] text-zinc-500">
                            {t("install.gpuUtil", { pct: gpu.utilization_gpu.toFixed(0) })}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {((gpu.vram_total_mb - gpu.vram_free_mb) / 1024).toFixed(1)}/{(gpu.vram_total_mb / 1024).toFixed(0)} GB
                          </div>
                        </div>
                      </label>
                    ))}
                    {!hasGpus && (
                      <p className="px-2 py-1.5 text-xs text-zinc-400">
                        {gpuRequired ? t("install.gpuMissing") : t("install.gpuNone")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Provedor de IA */}
              {templateLlmConfig && compatibleProviders.length > 0 && (
                <div className="border-t border-zinc-200 pt-4">
                  <label className="text-sm font-medium text-zinc-700">{t("install.llmTitle")}</label>
                  <p className="mt-1 text-xs text-zinc-400">{t("install.llmHint")}</p>

                  <select
                    value={selectedProviderId ?? ""}
                    onChange={(e) => {
                      setSelectedProviderId(e.target.value ? Number(e.target.value) : null);
                      setSelectedModel("");
                    }}
                    className="mt-2 h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                  >
                    <option value="">{t("install.llmNone")}</option>
                    {compatibleProviders.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({PROVIDER_LABELS[p.provider_type] || p.provider_type})
                      </option>
                    ))}
                  </select>

                  {selectedProviderId && availableModels.length > 0 && (
                    <div className="mt-2">
                      <label className="text-xs font-medium text-zinc-600">{t("install.llmModel")}</label>
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
                    <p className="mt-2 text-xs text-zinc-400">{t("install.llmNoModels")}</p>
                  )}
                </div>
              )}

              {templateLlmConfig && compatibleProviders.length === 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <Brain className="h-4 w-4" />
                    <span className="font-medium">{t("install.llmSupportsTitle")}</span>
                  </div>
                  <p className="mt-1 text-xs text-amber-600">
                    {t("install.llmSupportsHint")}{" "}
                    {templateLlmConfig.supported_providers.map((p) => PROVIDER_LABELS[p] || p).join(", ")}
                  </p>
                </div>
              )}

              {/* Campos de configuração do template */}
              {templateConfigFields.length > 0 && (
                <div className="border-t border-zinc-200 pt-4">
                  <label className="text-sm font-medium text-zinc-700">{t("install.configTitle")}</label>
                  <div className="mt-2">
                    <ConfigForm fields={templateConfigFields} values={configValues} onChange={setConfigValues} />
                  </div>
                </div>
              )}
            </>
          )
        )}
      </DialogBody>

      <DialogFooter>
        {isInstalling ? (
          <Button variant="outline" onClick={onClose}>
            {jobTerminal ? t("btn.close") : t("btn.hide")}
          </Button>
        ) : isInstalled ? (
          <Button variant="outline" onClick={onClose}>{t("btn.close")}</Button>
        ) : (
          <>
            <Button variant="outline" onClick={onClose}>{t("btn.cancel")}</Button>
            <Button onClick={handleInstall} disabled={installApp.isPending}>
              {installApp.isPending ? (
                <>
                  <Spinner size="sm" /> {t("btn.installing")}
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" /> {t("card.install")}
                </>
              )}
            </Button>
          </>
        )}
      </DialogFooter>
    </Dialog>
  );
}
