import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLLMProviders,
  createLLMProvider,
  updateLLMProvider,
  deleteLLMProvider,
  testLLMConnection,
  toggleLLMProvider,
} from "@/api/llm-providers";

export function useLLMProviders() {
  return useQuery({
    queryKey: ["llm-providers"],
    queryFn: getLLMProviders,
  });
}

export function useCreateLLMProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLLMProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llm-providers"] });
    },
  });
}

export function useUpdateLLMProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateLLMProvider>[1] }) =>
      updateLLMProvider(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llm-providers"] });
    },
  });
}

export function useDeleteLLMProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLLMProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llm-providers"] });
    },
  });
}

export function useTestLLMConnection() {
  return useMutation({
    mutationFn: testLLMConnection,
  });
}

export function useToggleLLMProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleLLMProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llm-providers"] });
    },
  });
}
