import { useState } from "react";
import {
  useLLMProviders,
  useCreateLLMProvider,
  useUpdateLLMProvider,
  useDeleteLLMProvider,
  useTestLLMConnection,
  useToggleLLMProvider,
} from "@/hooks/useLLMProviders";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Dialog, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { LLMProvider } from "@/lib/types";
import {
  Plus,
  Brain,
  Zap,
  Globe,
  Network,
  Sparkles,
  Server,
  Trash2,
  TestTube2,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Edit2,
  Key,
} from "lucide-react";

const PROVIDER_CONFIG: Record<string, { label: string; icon: typeof Brain; color: string; needsApiKey: boolean; needsBaseUrl: boolean; defaultBaseUrl: string }> = {
  openai: { label: "OpenAI", icon: Zap, color: "bg-emerald-50 text-emerald-700 border-emerald-200", needsApiKey: true, needsBaseUrl: false, defaultBaseUrl: "https://api.openai.com/v1" },
  gemini: { label: "Google Gemini", icon: Sparkles, color: "bg-blue-50 text-blue-700 border-blue-200", needsApiKey: true, needsBaseUrl: false, defaultBaseUrl: "https://generativelanguage.googleapis.com" },
  anthropic: { label: "Anthropic", icon: Brain, color: "bg-orange-50 text-orange-700 border-orange-200", needsApiKey: true, needsBaseUrl: false, defaultBaseUrl: "https://api.anthropic.com" },
  ollama: { label: "Ollama (Local)", icon: Server, color: "bg-violet-50 text-violet-700 border-violet-200", needsApiKey: false, needsBaseUrl: true, defaultBaseUrl: "http://localhost:11434" },
  openrouter: { label: "OpenRouter", icon: Network, color: "bg-rose-50 text-rose-700 border-rose-200", needsApiKey: true, needsBaseUrl: true, defaultBaseUrl: "https://openrouter.ai/api/v1" },
};

interface ProviderFormData {
  name: string;
  provider_type: string;
  api_key: string;
  base_url: string;
  is_default: boolean;
}

const emptyForm: ProviderFormData = {
  name: "",
  provider_type: "openai",
  api_key: "",
  base_url: "http://localhost:11434",
  is_default: false,
};

export function LLMProvidersPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingProvider, setEditingProvider] = useState<LLMProvider | null>(null);
  const [form, setForm] = useState<ProviderFormData>(emptyForm);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; models: string[] } | null>(null);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [showModels, setShowModels] = useState<number | null>(null);

  const { data: providers, isLoading } = useLLMProviders();
  const createProvider = useCreateLLMProvider();
  const updateProvider = useUpdateLLMProvider();
  const deleteProvider = useDeleteLLMProvider();
  const testConnection = useTestLLMConnection();
  const toggleProvider = useToggleLLMProvider();

  const handleOpenCreate = () => {
    setEditingProvider(null);
    setForm(emptyForm);
    setTestResult(null);
    setShowDialog(true);
  };

  const handleOpenEdit = (provider: LLMProvider) => {
    setEditingProvider(provider);
    setForm({
      name: provider.name,
      provider_type: provider.provider_type,
      api_key: "",
      base_url: provider.base_url || PROVIDER_CONFIG[provider.provider_type]?.defaultBaseUrl || "",
      is_default: provider.is_default,
    });
    setTestResult(null);
    setShowDialog(true);
  };

  const handleSubmit = () => {
    const payload: Record<string, unknown> = {
      name: form.name,
      provider_type: form.provider_type,
      is_default: form.is_default,
    };
    if (form.api_key) payload.api_key = form.api_key;
    if (form.base_url && PROVIDER_CONFIG[form.provider_type]?.needsBaseUrl) {
      payload.base_url = form.base_url;
    }

    if (editingProvider) {
      updateProvider.mutate(
        { id: editingProvider.id, data: payload },
        { onSuccess: () => setShowDialog(false) },
      );
    } else {
      createProvider.mutate(payload as Parameters<typeof createProvider.mutate>[0], {
        onSuccess: () => setShowDialog(false),
      });
    }
  };

  const handleTest = async (id: number) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const result = await testConnection.mutateAsync(id);
      setTestResult(result);
    } catch {
      setTestResult({ success: false, message: "Connection test failed", models: [] });
    }
    setTestingId(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this LLM provider? Apps using it will lose their connection.")) {
      deleteProvider.mutate(id);
    }
  };

  const selectedTypeConfig = PROVIDER_CONFIG[form.provider_type];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">LLM Providers</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Configure AI model providers for your applications
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Add Provider
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-xl border border-zinc-200 bg-zinc-50 animate-pulse" />
          ))}
        </div>
      ) : !providers?.length ? (
        <EmptyState
          title="No LLM providers configured"
          description="Add an OpenAI, Gemini, Anthropic, Ollama, or OpenRouter provider to connect your apps to AI models"
          action={
            <Button onClick={handleOpenCreate} size="sm">
              <Plus className="h-3.5 w-3.5" />
              Add Provider
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {providers.map((provider) => {
            const config = PROVIDER_CONFIG[provider.provider_type] || PROVIDER_CONFIG.openai;
            const Icon = config.icon;

            return (
              <Card key={provider.id} className={!provider.enabled ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CardTitle>{provider.name}</CardTitle>
                        {provider.is_default && (
                          <Badge variant="info">Default</Badge>
                        )}
                        {!provider.enabled && (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </div>
                      <CardDescription>{config.label}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleProvider.mutate(provider.id)}
                        className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                        title={provider.enabled ? "Disable" : "Enable"}
                      >
                        {provider.enabled ? (
                          <ToggleRight className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(provider)}
                        className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(provider.id)}
                        className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Key className="h-3 w-3" />
                      {provider.has_api_key ? "API key configured" : "No API key"}
                    </div>
                    {provider.base_url && (
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Globe className="h-3 w-3" />
                        <span className="truncate">{provider.base_url}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTest(provider.id)}
                        disabled={testingId === provider.id}
                      >
                        {testingId === provider.id ? (
                          <><Loader2 className="h-3 w-3 animate-spin" /> Testing...</>
                        ) : (
                          <><TestTube2 className="h-3 w-3" /> Test</>
                        )}
                      </Button>
                      {provider.models.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowModels(showModels === provider.id ? null : provider.id)}
                        >
                          {provider.models.length} models
                        </Button>
                      )}
                    </div>
                    {testingId === null && testResult && testingId !== provider.id && null}
                    {showModels === provider.id && provider.models.length > 0 && (
                      <div className="mt-2 max-h-32 overflow-y-auto rounded-lg border border-zinc-200 p-2">
                        {provider.models.map((m) => (
                          <div key={m} className="px-2 py-0.5 text-xs text-zinc-600 font-mono truncate">
                            {m}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Provider Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogHeader>
          <DialogTitle>{editingProvider ? `Edit ${editingProvider.name}` : "Add LLM Provider"}</DialogTitle>
          <DialogClose onClose={() => setShowDialog(false)} />
        </DialogHeader>
        <DialogBody className="space-y-4">
          {!editingProvider && (
            <div>
              <label className="text-sm font-medium text-zinc-700">Provider Type</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {Object.entries(PROVIDER_CONFIG).map(([type, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => setForm((f) => ({ ...f, provider_type: type, base_url: cfg.defaultBaseUrl }))}
                      className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                        form.provider_type === type
                          ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900"
                          : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-zinc-700">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. My OpenAI, Production Gemini"
              className="mt-1 h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
          </div>

          {selectedTypeConfig?.needsApiKey && (
            <div>
              <label className="text-sm font-medium text-zinc-700">API Key</label>
              <input
                type="password"
                value={form.api_key}
                onChange={(e) => setForm((f) => ({ ...f, api_key: e.target.value }))}
                placeholder={editingProvider ? "Leave empty to keep current key" : "sk-... or AIza..."}
                className="mt-1 h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              />
            </div>
          )}

          {selectedTypeConfig?.needsBaseUrl && (
            <div>
              <label className="text-sm font-medium text-zinc-700">Base URL</label>
              <input
                type="text"
                value={form.base_url}
                onChange={(e) => setForm((f) => ({ ...f, base_url: e.target.value }))}
                placeholder="http://localhost:11434"
                className="mt-1 h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              />
            </div>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
            />
            <span className="text-zinc-700 font-medium">Set as default provider</span>
          </label>

          {/* Test result inside dialog */}
          {testResult && (
            <div className={`rounded-lg border p-3 text-sm ${
              testResult.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}>
              <div className="flex items-center gap-2 font-medium">
                {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {testResult.message}
              </div>
              {testResult.models.length > 0 && (
                <p className="mt-1 text-xs opacity-80">
                  {testResult.models.length} models available
                </p>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
          {editingProvider && (
            <Button
              variant="outline"
              onClick={() => handleTest(editingProvider.id)}
              disabled={testingId === editingProvider.id}
            >
              {testingId === editingProvider.id ? <Spinner size="sm" /> : <TestTube2 className="h-3.5 w-3.5" />}
              Test
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!form.name || createProvider.isPending || updateProvider.isPending}
          >
            {(createProvider.isPending || updateProvider.isPending) ? (
              <><Spinner size="sm" /> Saving...</>
            ) : (
              editingProvider ? "Save Changes" : "Add Provider"
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
