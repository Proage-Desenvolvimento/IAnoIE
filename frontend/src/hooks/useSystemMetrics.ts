import { useQuery } from "@tanstack/react-query";
import { getSystemMetrics, getSystemMetricsHistory } from "@/api/system";

export function useSystemMetrics() {
  return useQuery({
    queryKey: ["system-metrics"],
    queryFn: getSystemMetrics,
    refetchInterval: 10_000,
  });
}

export function useSystemMetricsHistory(hours = 24) {
  return useQuery({
    queryKey: ["system-metrics-history", hours],
    queryFn: () => getSystemMetricsHistory(hours),
    refetchInterval: 60_000,
  });
}
