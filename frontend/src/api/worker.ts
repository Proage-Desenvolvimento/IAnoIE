import { api } from "./client";
import type { WorkerHealth } from "@/lib/types";

export async function getWorkerHealth() {
  return api.get("api/v1/worker/health").json<WorkerHealth>();
}
