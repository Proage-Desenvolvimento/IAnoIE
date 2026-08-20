import { api } from "./client";
import type { App, PaginatedResponse, TemplateConfig } from "@/lib/types";

export async function getApps(params?: { category?: string; search?: string; page?: number }) {
  // per_page=100 (máx. do backend): o catálogo não pagina na UI e o default de 20
  // cortava apps quando a lista cresceu (mkt22 e n8n sumiam da aba "Todos").
  return api
    .get("api/v1/apps", { searchParams: { per_page: 100, ...params } })
    .json<PaginatedResponse<App>>();
}

export async function getApp(slug: string) {
  return api.get(`api/v1/apps/${slug}`).json<App>();
}

export async function getTemplateConfig(slug: string) {
  return api.get(`api/v1/apps/${slug}/template-config`).json<TemplateConfig>();
}
