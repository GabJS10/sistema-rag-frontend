"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Menu,
  Mic,
  Send,
  FileText,
  Check,
  Loader2,
  ArrowUpDown,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, KeyboardEvent, useCallback } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Document, Message } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useInvalidateConversations } from "@/hooks/use-chat-query";

import { useSidebar } from "@/components/chat/sidebar-context";

interface ChatAreaProps {
  initialMessages?: Message[];
  conversationId?: string | null;
}

export function ChatArea({
  initialMessages = [],
  conversationId,
}: ChatAreaProps) {
  const { isOpen: isSidebarOpen, toggle: onToggleSidebar } = useSidebar();
  const router = useRouter();
  const queryClient = useQueryClient();
  const invalidateConversations = useInvalidateConversations();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [useReRank, setUseReRank] = useState(false);
  const [useVariants, setUseVariants] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Documents State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);

  // Chat State
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const messagesRef = useRef(messages);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(conversationId || null);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync messagesRef with messages state to access latest messages in callbacks
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Sync messages and conversationId when props change
  useEffect(() => {
    setMessages(initialMessages);
    setCurrentConversationId(conversationId || null);
  }, [initialMessages, conversationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  // Fetch Documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch("/api/dashboard/documents");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setDocuments(data);
          }
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoadingDocuments(false);
      }
    };

    fetchDocuments();
  }, []);

  // Define message handler
  const handleWebSocketMessage = useCallback(
    (message: any) => {
      const type = message.type as string;
      const data = message.data;

      // Handle success case separately to avoid side effects during render (setMessages)
      if (type === "success") {
        console.log("Success!", data);

        if (data.conversation_id && !currentConversationId) {
          const newId = data.conversation_id;
          setCurrentConversationId(newId);

          // OPTIMISTIC UPDATE:
          // Use messagesRef.current to get the latest state without adding 'messages' to dependencies
          const currentMessages = messagesRef.current;

          // 1. Pre-fill the cache
          queryClient.setQueryData(["messages", newId], currentMessages);

          // 2. Refresh sidebar
          invalidateConversations();

          // 3. Update URL
          router.replace(`/chat/${newId}`);
        }
        return;
      }

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsgIndex = newMessages.length - 1;

        if (
          lastMsgIndex < 0 ||
          newMessages[lastMsgIndex].role !== "assistant"
        ) {
          return prev;
        }

        const lastMsg = { ...newMessages[lastMsgIndex] };

        switch (type) {
          case "status":
            lastMsg.status = data as string;
            break;
          case "sources":
            lastMsg.sources = data as string[];
            break;
          case "token":
            lastMsg.content += data as string;
            // Clear status when generating content if desired, or keep it
            if (lastMsg.status === "Thinking...") lastMsg.status = undefined;
            break;
          case "done":
            lastMsg.isStreaming = false;
            lastMsg.status = undefined;
            setIsStreaming(false);
            break;
          case "error":
            lastMsg.isStreaming = false;
            lastMsg.status = "Error: " + (data as string);
            setIsStreaming(false);
            break;
        }

        newMessages[lastMsgIndex] = lastMsg;
        return newMessages;
      });
    },
    [currentConversationId, invalidateConversations, queryClient, router],
  );

  // WebSocket Hook with callback
  const { isConnected, sendMessage, error } = useWebSocket({
    onMessage: handleWebSocketMessage,
  });

  const handleSendMessage = () => {
    if (!inputValue.trim() || isStreaming || !isConnected) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
      status: "Thinking...",
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);
    setInputValue("");

    // Send to WebSocket
    sendMessage({
      question: userMsg.content,
      document_id: selectedDocId,
      conversation_id: currentConversationId,
      re_rank: useReRank,
      variants: useVariants,
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleDoc = (id: string) => {
    setSelectedDocId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <main className="flex-1 flex flex-col relative bg-background overflow-hidden">
      {/* Background Grid - subtle indication of structure */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header / Toggle for Desktop (when sidebar closed) or Mobile */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        {isSidebarOpen ? null : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            exit={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleSidebar}
              className="text-zinc-400 hover:text-white hover:bg-zinc-900 border-zinc-800 bg-black/50 backdrop-blur-sm h-9 w-9"
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div className="h-9 px-3 flex items-center bg-black/50 backdrop-blur-sm border border-zinc-800 rounded-md">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                Console_Active
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Header (Simplified for this component, assuming parent handles layout flexibility) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-background border-b border-white/5 text-white absolute w-full top-0 left-0 z-0">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <Menu className="w-5 h-5" />
        </Button>
        <span className="font-mono text-xs uppercase tracking-widest">
          Intel_Core
        </span>
        <div className="w-6" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col pt-14 md:pt-0">
        {messages.length === 0 ? (
          /* Empty State / Hero */
          <motion.div
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-4"
          >
            <div className="flex flex-col items-center justify-center gap-6 mb-12">
              <div className="w-20 h-20 bg-zinc-950 border border-zinc-800 flex items-center justify-center relative group">
                {/* Data Beam Effect */}
                <div className="absolute inset-0 bg-emerald-500/5 blur-xl group-hover:bg-emerald-500/10 transition-colors duration-500" />
                <div className="w-12 h-12 bg-zinc-900 border border-zinc-700 flex items-center justify-center relative z-10">
                  <div
                    className={`w-2 h-2 ${isConnected ? "bg-emerald-500" : "bg-amber-500"} rounded-sm animate-pulse`}
                  />
                </div>

                {/* Tech accents */}
                <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-zinc-600" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-zinc-600" />
              </div>

              <div className="text-center space-y-2">
                <h1 className="text-2xl md:text-3xl font-medium text-white tracking-tight">
                  System Ready
                </h1>
                <p className="text-sm text-zinc-500 font-mono">
                  {isConnected
                    ? "Awaiting query parameters..."
                    : "Connecting to secure channel..."}
                </p>
                {error && (
                  <p className="text-xs text-red-500 font-mono mt-2">{error}</p>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Messages List */
          <ScrollArea className="flex-1 px-4 py-4 md:px-8">
            <div className="max-w-3xl mx-auto flex flex-col gap-6 py-6 pb-20">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col gap-2 max-w-[85%]",
                    msg.role === "user"
                      ? "self-end items-end"
                      : "self-start items-start",
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-zinc-800 text-white rounded-br-none"
                        : "bg-zinc-900/50 border border-zinc-800 text-zinc-300 rounded-bl-none",
                    )}
                  >
                    {msg.content}
                    {msg.isStreaming && !msg.content && (
                      <span className="animate-pulse">_</span>
                    )}
                  </div>

                  {msg.role === "assistant" && (
                    <div className="flex flex-wrap gap-2 items-center">
                      {msg.status && (
                        <span className="text-[10px] font-mono text-emerald-500/80 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          {msg.status}
                        </span>
                      )}

                      {msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {msg.sources.map((source, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900/50 text-zinc-500"
                            >
                              {source}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input Area */}
      <div className="w-full max-w-3xl mx-auto px-4 pb-6 md:pb-8 z-10 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative group flex flex-col gap-2"
        >
          {/* File Selection Dropdown */}
          <AnimatePresence>
            {isDropdownOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 mb-2 bg-zinc-950 border border-zinc-800 w-72 shadow-2xl overflow-hidden z-20"
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900/50">
                  <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                    Context_Source
                  </div>
                  <div className="text-[10px] text-zinc-600">
                    {selectedDocId ? "1 selected" : "0 selected"}
                  </div>
                </div>

                <div
                  className="flex flex-col max-h-56 overflow-y-auto p-1"
                  ref={dropdownRef}
                >
                  {isLoadingDocuments ? (
                    <div className="p-4 text-center text-xs text-zinc-500 font-mono flex items-center justify-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading sources...
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="p-4 text-center text-xs text-zinc-500 font-mono">
                      No documents found.
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => toggleDoc(doc.id)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-sm text-left transition-all border border-transparent w-full",
                          selectedDocId === doc.id
                            ? "bg-zinc-900 border-zinc-800 text-white"
                            : "hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200",
                        )}
                      >
                        <div
                          className={cn(
                            "w-3 h-3 border flex items-center justify-center shrink-0 transition-colors",
                            selectedDocId === doc.id
                              ? "bg-emerald-500 border-emerald-500 text-black"
                              : "border-zinc-700 bg-transparent",
                          )}
                        >
                          {/* Checkbox visual */}
                        </div>
                        <span className="truncate font-mono text-xs">
                          {doc.name}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div
            className={cn(
              "relative flex flex-col bg-zinc-950 border transition-colors shadow-lg",
              isStreaming
                ? "border-emerald-500/20"
                : "border-zinc-800 focus-within:border-zinc-600",
            )}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-900">
              <div className="flex items-center gap-2 w-full">
                <Button
                  onClick={() => {
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-2 text-[10px] font-mono uppercase tracking-wide gap-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-sm border border-transparent hover:border-zinc-800 transition-all",
                    isDropdownOpen && "bg-zinc-900 text-white border-zinc-800",
                    selectedDocId && "text-emerald-500",
                  )}
                >
                  <Plus className="w-3 h-3" />
                  {selectedDocId ? "Context Active" : "Add Context"}
                </Button>

                <div className="h-4 w-[1px] bg-zinc-800" />

                <Button
                  onClick={() => setUseReRank(!useReRank)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-2 text-[10px] font-mono uppercase tracking-wide gap-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-sm border border-transparent hover:border-zinc-800 transition-all",
                    useReRank && "bg-zinc-900 text-emerald-500 border-zinc-800",
                  )}
                >
                  <ArrowUpDown className="w-3 h-3" />
                  Re-Rank
                </Button>

                <Button
                  onClick={() => setUseVariants(!useVariants)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-2 text-[10px] font-mono uppercase tracking-wide gap-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-sm border border-transparent hover:border-zinc-800 transition-all",
                    useVariants &&
                      "bg-zinc-900 text-emerald-500 border-zinc-800",
                  )}
                >
                  <Layers className="w-3 h-3" />
                  Variants
                </Button>
              </div>
            </div>

            <div className="relative">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
                placeholder={
                  isStreaming
                    ? "Processing query..."
                    : "Enter command or query..."
                }
                className="min-h-[60px] w-full resize-none bg-transparent border-none text-sm p-4 focus-visible:ring-0 placeholder:text-zinc-600 font-normal disabled:opacity-50"
              />

              <div className="absolute bottom-3 right-3 flex items-center gap-1">
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isStreaming || !isConnected}
                  className={cn(
                    "h-7 w-7 rounded-sm transition-colors",
                    isStreaming
                      ? "bg-zinc-800 text-zinc-500"
                      : "bg-white text-black hover:bg-zinc-200",
                  )}
                >
                  {isStreaming ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center px-1">
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono">
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full border",
                    isConnected
                      ? "bg-emerald-900/50 border-emerald-500/50"
                      : "bg-red-900/50 border-red-500/50",
                  )}
                ></div>
                {isConnected ? "SYSTEM_ONLINE" : "DISCONNECTED"}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-700"></div>
                LATENCY: 12ms
              </div>
            </div>
            <p className="text-[10px] text-zinc-700 font-mono text-right">
              CONFIDENTIAL // INTERNAL USE ONLY
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
