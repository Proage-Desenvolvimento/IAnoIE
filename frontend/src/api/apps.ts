import { api } from "./client";
import type { App, PaginatedResponse, TemplateConfigField } from "@/lib/types";

export async function getApps(params?: { category?: string; search?: string; page?: number }) {
  return api.get("api/v1/apps", { searchParams: params }).json<PaginatedResponse<App>>();
}

export async function getApp(slug: string) {
  return api.get(`api/v1/apps/${slug}`).json<App>();
}

export async function getTemplateConfig(slug: string) {
  return api.get(`api/v1/apps/${slug}/template-config`).json<{ config: TemplateConfigField[] }>();
}
