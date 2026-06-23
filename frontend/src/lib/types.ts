export interface User {
  id: number;
  email: string;
  role: "admin" | "user";
}

export interface App {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon_url: string | null;
  version: string;
  gpu_requirements: Record<string, unknown> | null;
}

export interface Installation {
  id: number;
  app_id: number;
  app_name: string;
  app_slug: string;
  app_icon: string | null;
  status: "pending" | "installing" | "running" | "stopped" | "error" | "uninstalling";
  container_id: string | null;
  port: number | null;
  domain: string | null;
  config: Record<string, unknown> | null;
  runtime_info: Record<string, unknown> | null;
  llm_provider_id: number | null;
  llm_provider_name: string | null;
  llm_provider_type: string | null;
  llm_model: string | null;
  access: {
    url: string | null;
    credentials: { label: string; value: string }[];
    note: string | null;
  } | null;
  created_at: string;
}

export interface Job {
  id: number;
  type: string;
  installation_id: number | null;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  error: string | null;
  created_at: string;
}

export interface GPUInfo {
  index: number;
  uuid: string;
  name: string;
  utilization_gpu: number;
  utilization_memory: number;
  vram_used_mb: number;
  vram_total_mb: number;
  vram_free_mb: number;
  temperature: number;
  power_usage_w: number;
}

export interface GPUStatus {
  gpus: GPUInfo[];
  count: number;
}

export interface SystemMetrics {
  cpu_percent: number;
  cpu_count: number;
  memory_total: number;
  memory_used: number;
  memory_percent: number;
  disk_total: number;
  disk_used: number;
  disk_percent: number;
  net_bytes_sent: number;
  net_bytes_recv: number;
  gpus: GPUInfo[];
  timestamp: string;
}

export interface LLMProvider {
  id: number;
  name: string;
  provider_type: "openai" | "gemini" | "anthropic" | "ollama" | "openrouter";
  base_url: string | null;
  models: string[];
  is_default: boolean;
  enabled: boolean;
  has_api_key: boolean;
  created_at: string;
}

export interface LLMProviderTestResult {
  success: boolean;
  message: string;
  models: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface TemplateConfigField {
  key: string;
  label: string;
  type: "string" | "select" | "boolean" | "number";
  default?: unknown;
  required?: boolean;
  options?: unknown[];
  description?: string;
}

export interface TemplateConfig {
  config: TemplateConfigField[];
  llm?: {
    supported_providers: string[];
    connection_env?: Record<string, Record<string, string>>;
  };
  gpu?: {
    required: boolean;
    min_count?: number;
    max_count?: number;
  };
}

export interface LogEntry {
  container_id: string;
  container_name: string;
  line: string;
}

export interface InstallLog {
  id: number;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  container_name: string | null;
  timestamp: string;
}

export interface WorkerNode {
  name: string;
  active: number;
  processed: number | null;
  pool: string | null;
}

export interface WorkerHealth {
  status: "healthy" | "unhealthy";
  workers_online: number;
  active_tasks: number;
  broker_online: boolean;
  workers: WorkerNode[];
  timestamp: string;
}
