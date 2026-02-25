import { useQuery } from "@tanstack/react-query";
import { Document } from "@/lib/types";

export function useDocuments() {
  return useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/documents");
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}