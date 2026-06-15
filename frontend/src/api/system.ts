import { api } from "./client";
import type { SystemMetrics } from "@/lib/types";

export async function getSystemMetrics() {
  return api.get("api/v1/system/metrics").json<SystemMetrics>();
}

export async function getSystemMetricsHistory(hours = 24) {
  return api.get("api/v1/system/metrics/history", { searchParams: { hours } }).json<Array<{
    timestamp: string;
    cpu_percent: number;
    memory_percent: number;
    disk_percent: number;
  }>>();
}
