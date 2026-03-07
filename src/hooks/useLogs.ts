import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import apiClient from "../api/client";

// 2. Hook for checking duplicates before upload
export function useCheckDuplicate() {
  return useMutation({
    mutationFn: async (hash: string) => {
      const { data } = await apiClient.get(`/api/logs/check/${hash}`);
      return data; // returns { exists: boolean, uploadId?: string, status?: string }
    },
  });
}

// 3. Hook for the file upload
export function useUploadLog() {
  return useMutation({
    mutationFn: async ({ file, hash }: { file: File; hash: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("hash", hash);

      const { data } = await apiClient.post("/api/logs/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },
  });
}

// Hook for the Log Ingestion Page (Only pending/processing)
export function useActiveLogs() {
  return useQuery({
    queryKey: ["active-logs"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/logs?active=true");
      return data;
    },
    // Fast polling because these are currently being worked on
    refetchInterval: 3000,
  });
}

// Hook for the History Page (All logs)
export function useAllLogs() {
  return useQuery({
    queryKey: ["all-logs"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/logs");
      return data;
    },
    // Slower polling just to keep the history table relatively fresh
    refetchInterval: 10000,
  });
}

// Hook for the detailed Analysis Report page
export function useLogAnalysis(jobId: string | undefined) {
  return useQuery({
    queryKey: ["log-analysis", jobId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/logs/${jobId}`);
      return data;
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "processing" ? 3000 : false;
    },
  });
}

// NEW: Infinite scroll hook for events
export function useLogEventsInfinite(
  jobId: string | undefined,
  onlyAnomalies: boolean = true,
  sortBy: string = "severity",
  searchIp: string = "",
  severityFilter: string | null = "all",
) {
  return useInfiniteQuery({
    // Adding the filters to the queryKey forces React Query to re-fetch when they change
    queryKey: [
      "log-events-infinite",
      jobId,
      onlyAnomalies,
      sortBy,
      searchIp,
      severityFilter,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await apiClient.get(`/api/logs/${jobId}/events`, {
        params: {
          page: pageParam,
          limit: 20,
          onlyAnomalies,
          sortBy,
          clientIp: searchIp || undefined,
          severity: severityFilter !== "all" ? severityFilter : undefined,
        },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!jobId,
    staleTime: 0, // Prevents lag
    gcTime: 0, // Force hard reset of data when filters change
  });
}

// ==========================================
// NEW: Standard Paginated Hook for Raw Logs Data Lake
// ==========================================
export function useRawLogsPaginated(
  jobId: string | undefined,
  page: number,
  limit: number,
  searchQuery: string,
) {
  return useQuery({
    queryKey: ["raw-logs", jobId, page, limit, searchQuery],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/logs/${jobId}/raw`, {
        params: {
          page,
          limit,
          search: searchQuery || undefined,
        },
      });
      return data;
    },
    enabled: !!jobId,
    // This is crucial for UI UX: it keeps the old table data visible while
    // fetching the next page, preventing the table height from collapsing to 0.
    placeholderData: (previousData) => previousData,
  });
}

// Add this to the bottom of useLogs.ts
export function useGlobalIntelligence(timeRange: string | null) {
  return useQuery({
    queryKey: ["global-intelligence", timeRange],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/intelligence", {
        params: { timeRange: timeRange || "24h" },
      });
      return data;
    },
  });
}
