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

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface LogEntry {
  container_id: string;
  container_name: string;
  line: string;
}
