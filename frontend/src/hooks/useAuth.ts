import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { login as loginApi, getMe } from "@/api/auth";

export function useAuth() {
  return useQuery({
    queryKey: ["auth"],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi(email, password),
    onSuccess: (data) => {
      localStorage.setItem("ianoie_token", data.access_token);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}
