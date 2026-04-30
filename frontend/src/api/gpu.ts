import { api } from "./client";
import type { GPUStatus } from "@/lib/types";

export async function getGpuStatus() {
  return api.get("api/v1/gpu/status").json<GPUStatus>();
}
