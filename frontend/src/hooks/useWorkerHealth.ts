import { useQuery } from "@tanstack/react-query";
import { getWorkerHealth } from "@/api/worker";

export function useWorkerHealth() {
  return useQuery({
    queryKey: ["worker-health"],
    queryFn: getWorkerHealth,
    refetchInterval: 15_000,
  });
}
