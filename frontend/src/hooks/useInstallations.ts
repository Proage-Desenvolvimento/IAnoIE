import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInstallations,
  createInstallation,
  deleteInstallation,
  actionInstallation,
  updateInstallationConfig,
} from "@/api/installations";

export function useInstallations(page = 1) {
  return useQuery({
    queryKey: ["installations", page],
    queryFn: () => getInstallations(page),
    // Auto-refresh while any installation is mid-transition (install/uninstall) or has a
    // non-terminal active job, so status badges + progress update live. Stops when idle.
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? [];
      const busy = items.some(
        (i) =>
          i.status === "pending" ||
          i.status === "installing" ||
          i.status === "uninstalling" ||
          (i.active_job != null &&
            (i.active_job.status === "pending" || i.active_job.status === "running")),
      );
      return busy ? 2000 : false;
    },
  });
}

export function useInstallApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      appId: number;
      config?: Record<string, unknown>;
      llm_provider_id?: number | null;
      llm_model?: string | null;
    }) =>
      createInstallation({
        app_id: params.appId,
        config: params.config,
        llm_provider_id: params.llm_provider_id,
        llm_model: params.llm_model,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installations"] });
    },
  });
}

export function useUninstallApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteInstallation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installations"] });
    },
  });
}

export function useAppAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: "start" | "stop" | "restart" }) =>
      actionInstallation(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installations"] });
    },
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      id: number;
      config: Record<string, unknown>;
      llm_provider_id?: number | null;
      llm_model?: string | null;
    }) =>
      updateInstallationConfig(params.id, {
        config: params.config,
        llm_provider_id: params.llm_provider_id,
        llm_model: params.llm_model,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installations"] });
    },
  });
}
