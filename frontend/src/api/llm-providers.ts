import { api } from "./client";
import type { LLMProvider, LLMProviderTestResult } from "@/lib/types";

export async function getLLMProviders() {
  return api.get("api/v1/llm-providers").json<LLMProvider[]>();
}

export async function createLLMProvider(data: {
  name: string;
  provider_type: string;
  api_key?: string;
  base_url?: string;
  is_default?: boolean;
}) {
  return api.post("api/v1/llm-providers", { json: data }).json<LLMProvider>();
}

export async function updateLLMProvider(
  id: number,
  data: {
    name?: string;
    api_key?: string;
    base_url?: string;
    models?: string[];
    is_default?: boolean;
    enabled?: boolean;
  },
) {
  return api.put(`api/v1/llm-providers/${id}`, { json: data }).json<LLMProvider>();
}

export async function deleteLLMProvider(id: number) {
  return api.delete(`api/v1/llm-providers/${id}`);
}

export async function testLLMConnection(id: number) {
  return api.post(`api/v1/llm-providers/${id}/test`).json<LLMProviderTestResult>();
}

export async function toggleLLMProvider(id: number) {
  return api.post(`api/v1/llm-providers/${id}/toggle`).json<LLMProvider>();
}
