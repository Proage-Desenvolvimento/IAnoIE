import { api } from "./client";
import type { Installation, PaginatedResponse } from "@/lib/types";

export async function getInstallations(page = 1) {
  return api.get("api/v1/installations", { searchParams: { page } }).json<PaginatedResponse<Installation>>();
}

export async function createInstallation(appId: number, config?: Record<string, unknown>) {
  return api.post("api/v1/installations", { json: { app_id: appId, config } }).json<{ installation_id: number; job_id: number }>();
}

export async function deleteInstallation(id: number) {
  return api.delete(`api/v1/installations/${id}`).json<{ installation_id: number; job_id: number }>();
}

export async function actionInstallation(id: number, action: "start" | "stop" | "restart") {
  return api.post(`api/v1/installations/${id}/${action}`).json<{ installation_id: number; job_id: number }>();
}
