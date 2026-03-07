import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/client";

// 1. Fetch Current User (Session Check)
export function useUser() {
  return useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/auth/me");
      return data.user;
    },
    retry: false, // Don't retry on 401s
    staleTime: 5 * 60 * 1000, // Consider session fresh for 5 minutes
  });
}

// 2. Login Mutation
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await apiClient.post("/api/auth/login", credentials);
      return data;
    },
    onSuccess: () => {
      // Force the app to re-fetch the user session
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
  });
}

// 3. Logout Mutation
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/api/auth/logout");
    },
    onSuccess: () => {
      // Clear all cached data so the next logged-in user doesn't see old logs
      queryClient.clear();
    },
  });
}
