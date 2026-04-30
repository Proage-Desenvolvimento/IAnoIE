import { useQuery } from "@tanstack/react-query";
import { getApps, getApp } from "@/api/apps";

export function useApps(params?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ["apps", params],
    queryFn: () => getApps(params),
  });
}

export function useApp(slug: string) {
  return useQuery({
    queryKey: ["app", slug],
    queryFn: () => getApp(slug),
    enabled: !!slug,
  });
}
