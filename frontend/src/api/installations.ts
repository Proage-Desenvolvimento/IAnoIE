import { api } from "./client";
import type { Installation, InstallLog, PaginatedResponse } from "@/lib/types";

export async function getInstallations(page = 1) {
  return api.get("api/v1/installations", { searchParams: { page } }).json<PaginatedResponse<Installation>>();
}

export async function getInstallLogs(id: number) {
  return api.get(`api/v1/installations/${id}/logs`).json<InstallLog[]>();
}

export async function createInstallation(data: {
  app_id: number;
  config?: Record<string, unknown>;
  llm_provider_id?: number | null;
  llm_model?: string | null;
}) {
  return api.post("api/v1/installations", { json: data }).json<{ installation_id: number; job_id: number }>();
}

export async function deleteInstallation(id: number) {
  return api.delete(`api/v1/installations/${id}`).json<{ installation_id: number; job_id: number }>();
}

export async function actionInstallation(id: number, action: "start" | "stop" | "restart" | "update") {
  return api.post(`api/v1/installations/${id}/${action}`).json<{ installation_id: number; job_id: number }>();
}

export async function updateInstallationConfig(
  id: number,
  data: {
    config: Record<string, unknown>;
    llm_provider_id?: number | null;
    llm_model?: string | null;
  },
) {
  return api.patch(`api/v1/installations/${id}/config`, { json: data }).json<{ installation_id: number; job_id: number }>();
}
