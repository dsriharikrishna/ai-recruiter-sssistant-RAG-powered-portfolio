"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";
import { LoginCredentials } from "../types";

export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

export function useCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      try {
        const user = await authService.getCurrentUser();
        setUser(user);
        return user;
      } catch {
        setUser(null);
        return null;
      }
    },
    retry: false,
  });
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(authKeys.user(), data.user);
      router.push("/dashboard");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      // Clear cookies and local dev session
      if (typeof document !== "undefined") {
        document.cookie = "dev_user=; path=/; max-age=0";
        document.cookie = "auth_session=; path=/; max-age=0";
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("dev_user");
      }
      clearAuth();
      queryClient.clear();
      router.push("/login");
    },
  });
}
