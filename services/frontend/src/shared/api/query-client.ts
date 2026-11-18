import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
          // Do not retry 401, 403, or 404 client errors
          if (
            typeof error === "object" &&
            error !== null &&
            "status" in error
          ) {
            const status = (error as { status: number }).status;
            if (status === 401 || status === 403 || status === 404) {
              return false;
            }
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
