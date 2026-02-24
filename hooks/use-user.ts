import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  nombre: string;
  avatar_url: string | null;
  fecha_nacimiento: string | null;
}

export function useUser() {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/get-user");
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}