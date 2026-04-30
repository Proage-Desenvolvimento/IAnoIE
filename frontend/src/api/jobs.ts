import { api } from "./client";
import type { Job } from "@/lib/types";

export async function getJob(id: number) {
  return api.get(`api/v1/jobs/${id}`).json<Job>();
}
