"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { dashboardService } from "../services/dashboard.service";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  site: () => [...dashboardKeys.all, "site"] as const,
  draft: () => [...dashboardKeys.all, "draft"] as const,
  job: (id: string) => [...dashboardKeys.all, "job", id] as const,
};

export function useSiteInfo() {
  return useQuery({
    queryKey: dashboardKeys.site(),
    queryFn: () => dashboardService.getSite(),
  });
}

export function useProfileDraft() {
  return useQuery({
    queryKey: dashboardKeys.draft(),
    queryFn: () => dashboardService.getProfileDraft(),
  });
}

export function useApproveProfile() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => dashboardService.approveProfile(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.draft() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.site() });
      router.push("/dashboard");
    },
  });
}

export function useUploadResume() {
  return useMutation({
    mutationFn: (file: File) => dashboardService.uploadResume(file),
  });
}
