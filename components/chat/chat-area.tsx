"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  ArrowUp,
  MoreHorizontal,
  Zap,
  Library,
  Copy,
  Layers,
  Search,
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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

  const contextTriggerRef = useRef<HTMLButtonElement>(null);
  const contextDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDropdownOpen &&
        contextDropdownRef.current &&
        !contextDropdownRef.current.contains(event.target as Node) &&
        contextTriggerRef.current &&
        !contextTriggerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

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

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    setMessages(initialMessages);
    setCurrentConversationId(conversationId || null);
  }, [initialMessages, conversationId]);

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

  const handleWebSocketMessage = useCallback(
    (message: any) => {
      const type = message.type as string;
      const data = message.data;

      if (type === "success") {
        if (data.conversation_id && !currentConversationId) {
          const newId = data.conversation_id;
          setCurrentConversationId(newId);
          const currentMessages = messagesRef.current;
          queryClient.setQueryData(["messages", newId], currentMessages);
          invalidateConversations();
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

  return (
    <main className="flex-1 flex flex-col relative bg-background h-full w-full font-sans">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Mobile Sidebar Toggle */}
      <div className="absolute top-4 left-4 z-10">
        {!isSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="text-muted-foreground hover:bg-muted/50 rounded-lg"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-2xl mx-auto w-full z-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center space-y-8"
            >
              <div className="w-16 h-16 bg-gradient-to-tr from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm ring-1 ring-inset ring-black/5 dark:ring-white/5">
                <Library className="w-8 h-8 text-foreground/80" />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Knowledge Base
                </h1>
                <p className="text-lg text-muted-foreground font-light">
                  Query your documents with precision.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 w-full max-w-lg mx-auto">
                {[
                  "Summarize key findings",
                  "Draft a report",
                  "Compare data points",
                  "Find contradictions",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInputValue(suggestion)}
                    className="px-4 py-3 text-sm font-medium text-muted-foreground/70 bg-background/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-foreground border border-black/5 dark:border-white/5 rounded-xl transition-all text-left shadow-sm hover:shadow"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          /* Messages List */
          <ScrollArea className="flex-1">
            <div className="w-full flex flex-col gap-6 py-10 pb-40">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex flex-col w-full px-4 sm:px-6",
                    msg.role === "user" ? "items-end" : "items-center",
                  )}
                >
                  <div
                    className={cn(
                      "w-full max-w-3xl flex gap-4",
                      msg.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {/* Assistant Avatar */}
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full border border-black/5 dark:border-white/10 bg-background flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                        <Zap className="w-4 h-4 text-emerald-500" />
                      </div>
                    )}

                    {/* Content Bubble */}
                    <div
                      className={cn(
                        "relative flex-1 overflow-hidden",
                        msg.role === "user"
                          ? "bg-zinc-100 dark:bg-zinc-800 text-foreground px-5 py-3.5 rounded-[20px] rounded-tr-md max-w-[85%] sm:max-w-[75%] shadow-sm"
                          : "text-foreground max-w-full",
                      )}
                    >
                      {msg.role === "user" ? (
                        <p className="whitespace-pre-wrap leading-7">
                          {msg.content}
                        </p>
                      ) : (
                        <div className="markdown-prose">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => (
                                <p className="mb-4 leading-7 last:mb-0">
                                  {children}
                                </p>
                              ),
                              h1: ({ children }) => (
                                <h1 className="text-2xl font-bold mb-4 mt-6">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-xl font-bold mb-3 mt-5">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-lg font-semibold mb-2 mt-4">
                                  {children}
                                </h3>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc pl-6 mb-4 space-y-1">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal pl-6 mb-4 space-y-1">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="leading-7">{children}</li>
                              ),
                              code: ({
                                className,
                                children,
                                ...props
                              }: any) => {
                                const match = /language-(\w+)/.exec(
                                  className || "",
                                );
                                const isInline = !match && !className;

                                return isInline ? (
                                  <code
                                    className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                ) : (
                                  <div className="relative my-4 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800">
                                    <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/50 border-b border-zinc-800">
                                      <span className="text-xs text-zinc-400 font-mono">
                                        {match?.[1] || "code"}
                                      </span>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-zinc-500 hover:text-zinc-300"
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <pre className="p-4 overflow-x-auto text-sm font-mono text-zinc-300">
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                    </pre>
                                  </div>
                                );
                              },
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-2 border-emerald-500/50 pl-4 italic text-muted-foreground my-4">
                                  {children}
                                </blockquote>
                              ),
                              table: ({ children }) => (
                                <div className="overflow-x-auto my-4 border rounded-lg">
                                  <table className="w-full text-sm text-left">
                                    {children}
                                  </table>
                                </div>
                              ),
                              th: ({ children }) => (
                                <th className="bg-muted px-4 py-2 font-semibold border-b">
                                  {children}
                                </th>
                              ),
                              td: ({ children }) => (
                                <td className="px-4 py-2 border-b last:border-0">
                                  {children}
                                </td>
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>

                          {msg.isStreaming && !msg.content && (
                            <div className="flex items-center gap-2 text-muted-foreground/50 animate-pulse mt-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                              <span className="text-sm font-medium">
                                Thinking...
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Assistant Metadata (Sources/Status) */}
                      {msg.role === "assistant" && (
                        <div className="mt-4 flex flex-col gap-2">
                          {/* Status Indicator */}
                          {msg.status && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-muted/30 w-fit px-2 py-1 rounded">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {msg.status}
                            </div>
                          )}

                          {/* Sources Grid */}
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                              {msg.sources.map((source, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 p-2 rounded-lg border border-black/5 dark:border-white/5 bg-background hover:bg-muted/50 transition-colors cursor-pointer group"
                                >
                                  <div className="w-5 h-5 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground group-hover:text-foreground">
                                    {idx + 1}
                                  </div>
                                  <span className="text-xs text-muted-foreground group-hover:text-foreground truncate">
                                    {source}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input Area (Bottom Fixed) */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* Gradient Fade Mask */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none" />

        <div className="w-full max-w-3xl mx-auto px-4 pb-6 relative">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className={cn(
              "flex flex-col bg-zinc-100 dark:bg-zinc-900/80 backdrop-blur-xl border border-transparent dark:border-white/5 shadow-lg rounded-[26px] overflow-hidden transition-all duration-300 ring-1 ring-black/5",
              isStreaming && "opacity-80 pointer-events-none",
              !isStreaming && "hover:ring-black/10 dark:hover:ring-white/10",
            )}
          >
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="Message RAG..."
              className="min-h-[52px] max-h-[200px] w-full resize-none bg-transparent border-none text-[16px] px-5 py-4 focus-visible:ring-0 placeholder:text-muted-foreground/40 font-normal leading-relaxed scrollbar-hide"
            />

            {/* Toolbar attached to bottom of input */}
            <div className="flex justify-between items-center px-2 pb-2">
              {/* Left Tools */}
              <div className="flex items-center gap-1 pl-2">
                <Button
                  ref={contextTriggerRef}
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={cn(
                    "h-8 rounded-lg text-xs font-medium gap-1.5 text-muted-foreground hover:text-foreground transition-all",
                    (selectedDocId || isDropdownOpen) &&
                      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Context</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUseReRank(!useReRank)}
                  className={cn(
                    "h-8 rounded-lg text-xs font-medium gap-1.5 text-muted-foreground hover:text-foreground transition-all",
                    useReRank &&
                      "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
                  )}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Re-rank</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUseVariants(!useVariants)}
                  className={cn(
                    "h-8 rounded-lg text-xs font-medium gap-1.5 text-muted-foreground hover:text-foreground transition-all",
                    useVariants &&
                      "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                  )}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Variants</span>
                </Button>
              </div>

              {/* Right Actions */}
              <div className="flex items-center pr-1">
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isStreaming || !isConnected}
                  className={cn(
                    "rounded-full w-8 h-8 transition-all duration-200 shadow-sm",
                    inputValue.trim()
                      ? "bg-foreground text-background hover:bg-foreground/90 scale-100 opacity-100"
                      : "bg-muted text-muted-foreground scale-90 opacity-0",
                  )}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Document Dropdown (Floating above input) */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                ref={contextDropdownRef}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full left-4 mb-2 w-72 dark:bg-zinc-950/50 backdrop-blur-md  shadow-xl rounded-2xl overflow-hidden z-30 ring-1 ring-black/5"
              >
                <div className="p-3 bg-muted/20">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Select Context
                  </h3>
                </div>
                <div className="max-h-56 overflow-y-auto p-1 scrollbar-thin">
                  {isLoadingDocuments ? (
                    <div className="p-6 flex justify-center">
                      <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="p-4 text-xs text-muted-foreground text-center italic">
                      No documents found.
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() =>
                          setSelectedDocId(
                            selectedDocId === doc.id ? null : doc.id,
                          )
                        }
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 group",
                          selectedDocId === doc.id
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium"
                            : "hover:bg-muted text-foreground/80",
                        )}
                      >
                        <div
                          className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                            selectedDocId === doc.id
                              ? "bg-emerald-500 border-emerald-500"
                              : "border-muted-foreground/30 bg-transparent group-hover:border-muted-foreground/60",
                          )}
                        >
                          {selectedDocId === doc.id && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="truncate flex-1">{doc.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mt-3">
            <p className="text-[10px] text-muted-foreground/40 font-medium tracking-wide">
              RAG Protocol v1.0 • Generated content can be inaccurate.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
