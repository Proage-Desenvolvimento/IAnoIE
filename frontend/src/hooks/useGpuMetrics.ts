import { useQuery } from "@tanstack/react-query";
import { getGpuStatus } from "@/api/gpu";

export function useGpuMetrics() {
  return useQuery({
    queryKey: ["gpu"],
    queryFn: getGpuStatus,
    refetchInterval: 10_000,
  });
}
