"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Conversation, Message } from "@/lib/types";

// Fetch all conversations
const fetchConversations = async (): Promise<Conversation[]> => {
  const res = await fetch("/api/chat/conversations");
  if (!res.ok) {
    throw new Error("Failed to fetch conversations");
  }
  return res.json();
};

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    // Refetch on window focus to keep list updated if changed elsewhere
    refetchOnWindowFocus: true,
  });
}

// Fetch messages for a specific conversation
const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  if (!conversationId) return [];

  const res = await fetch("/api/chat/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversation_id: conversationId }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }

  const data = await res.json();

  // Transform backend message to frontend message structure
  return data
    .map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.created_at),
      isStreaming: false,
    }))
    .sort((a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime());
};

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId, // Only fetch if ID is present
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

// Helper to invalidate conversations query (useful after creating a new chat)
export function useInvalidateConversations() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };
}
