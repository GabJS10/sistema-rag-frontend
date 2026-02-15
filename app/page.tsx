"use client";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatArea } from "@/components/chat/chat-area";
import { Conversation, Message } from "@/lib/types";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Conversations State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  // Messages State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Fetch conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/chat/conversations");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setConversations(data);
          }
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    fetchConversations();
  }, []);

  const handleSelectConversation = async (id: string) => {
    if (selectedConversationId === id) return;

    setSelectedConversationId(id);
    setIsLoadingMessages(true);
    setMessages([]); // Clear current messages immediately

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: id }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          // Transform backend message to frontend message
          const mappedMessages = data
            .map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.created_at),
              // Ensure status/isStreaming are undefined for historical messages
              isStreaming: false,
            }))
            .sort(
              (a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime(),
            ); // Sort ascending

          setMessages(mappedMessages);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  return (
    <div className="flex h-screen text-white font-sans overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        className="hidden md:flex"
        conversations={conversations}
        selectedId={selectedConversationId}
        onSelect={handleSelectConversation}
        isLoading={isLoadingConversations}
      />

      <ChatArea
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        initialMessages={messages}
        conversationId={selectedConversationId}
      />
    </div>
  );
}
