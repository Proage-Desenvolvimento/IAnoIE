import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInstallations,
  createInstallation,
  deleteInstallation,
  actionInstallation,
} from "@/api/installations";

export function useInstallations(page = 1) {
  return useQuery({
    queryKey: ["installations", page],
    queryFn: () => getInstallations(page),
  });
}

export function useInstallApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appId, config }: { appId: number; config?: Record<string, unknown> }) =>
      createInstallation(appId, config),
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
