"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Mic,
  ArrowUp,
  Globe,
  MoreHorizontal,
  Sparkles,
  Zap,
  Library
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
      variants: false,
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <main className="flex-1 flex flex-col relative bg-background h-full w-full">
      {/* Subtle Grid Background - Low opacity for depth */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Mobile Toggle */}
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

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {messages.length === 0 ? (
          /* Empty State - Research Hub Style */
          <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-2xl mx-auto w-full">
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
                {["Summarize key findings", "Draft a report", "Compare data points", "Find contradictions"].map((suggestion) => (
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
          /* Messages List - Document Block Style */
          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto flex flex-col gap-8 py-10 pb-40 px-4 sm:px-6">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    "flex flex-col gap-3 w-full",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  {/* Message Content */}
                  <div
                    className={cn(
                      "relative max-w-[85%] sm:max-w-[75%] text-base leading-7",
                      msg.role === "user"
                        ? "bg-zinc-100 dark:bg-zinc-800 text-foreground px-5 py-3 rounded-2xl rounded-tr-md"
                        : "pl-0 pr-0 text-foreground" // AI messages look like document text
                    )}
                  >
                    {msg.role === "assistant" && (
                       <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                             <Zap className="w-3.5 h-3.5 text-emerald-500" />
                          </div>
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Analysis</span>
                       </div>
                    )}
                    
                    {msg.content}
                    
                    {msg.isStreaming && !msg.content && (
                      <span className="inline-flex gap-1 items-center text-muted-foreground animate-pulse">
                        Processing...
                      </span>
                    )}
                  </div>

                  {/* Metadata / Sources (Evidence Rail) */}
                  {msg.role === "assistant" && (
                    <div className="w-full mt-2 pl-1 border-l-2 border-border/40 ml-1">
                      <div className="flex flex-col gap-2 pl-4">
                        {msg.status && (
                          <span className="text-xs text-muted-foreground/60 flex items-center gap-1.5 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {msg.status}
                          </span>
                        )}
                        
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {msg.sources.map((source, idx) => (
                              <div 
                                key={idx} 
                                className="group flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 px-3 py-1.5 rounded-lg hover:border-emerald-500/30 transition-colors cursor-pointer"
                              >
                                <div className="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-muted-foreground group-hover:text-emerald-500">
                                   {idx + 1}
                                </div>
                                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground truncate max-w-[150px]">
                                  {source}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Floating Command Center */}
      <div className="w-full max-w-3xl mx-auto px-4 pb-6 absolute bottom-0 left-0 right-0 z-20">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={cn(
            "relative flex flex-col bg-background/80 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300",
            isStreaming ? "opacity-80 pointer-events-none" : "hover:border-black/10 dark:hover:border-white/20 hover:shadow-3xl"
          )}
        >
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder="Ask a question or describe a task..."
            className="min-h-[60px] max-h-[200px] w-full resize-none bg-transparent border-none text-[15px] p-5 focus-visible:ring-0 placeholder:text-muted-foreground/40 font-normal leading-relaxed"
          />

          <div className="flex justify-between items-center px-3 pb-3 pt-1">
            <div className="flex items-center gap-1">
               <Button 
                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                 variant="ghost" 
                 size="sm" 
                 className={cn(
                   "rounded-lg text-muted-foreground/60 hover:text-foreground h-8 px-2 gap-1.5 transition-colors",
                   (selectedDocId || isDropdownOpen) && "text-emerald-600 bg-emerald-500/10"
                 )}
               >
                  <Plus className="w-4 h-4" />
                  <span className="text-xs font-medium">Context</span>
               </Button>
               
               <div className="w-[1px] h-4 bg-border mx-1" />

               <Button 
                 onClick={() => setUseReRank(!useReRank)}
                 variant="ghost" 
                 size="sm" 
                 className={cn(
                   "rounded-lg text-muted-foreground/60 hover:text-foreground h-8 px-2 gap-1.5 transition-colors",
                   useReRank && "text-indigo-500 bg-indigo-500/10"
                 )}
               >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Smart</span>
               </Button>
            </div>

            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isStreaming || !isConnected}
              className={cn(
                "rounded-xl w-9 h-9 transition-all duration-300 shadow-sm flex items-center justify-center",
                inputValue.trim() 
                  ? "bg-foreground text-background hover:bg-foreground/90 scale-100 opacity-100" 
                  : "bg-muted text-muted-foreground scale-95 opacity-50"
              )}
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
        
        {/* Document Selection Dropdown */}
        <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full left-4 mb-4 w-72 bg-popover border border-border/60 shadow-xl rounded-xl overflow-hidden z-30 ring-1 ring-black/5"
              >
                <div className="p-3 border-b border-border/40 bg-muted/20">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Available Sources</h3>
                </div>
                <div className="max-h-56 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted">
                  {isLoadingDocuments ? (
                    <div className="p-6 flex justify-center"><div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" /></div>
                  ) : documents.length === 0 ? (
                     <div className="p-4 text-xs text-muted-foreground text-center italic">No documents found.</div>
                  ) : (
                    documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocId(selectedDocId === doc.id ? null : doc.id)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 group",
                          selectedDocId === doc.id 
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium" 
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-foreground/80"
                        )}
                      >
                         <div className={cn(
                           "w-4 h-4 rounded border flex items-center justify-center transition-colors", 
                           selectedDocId === doc.id 
                             ? "bg-emerald-500 border-emerald-500" 
                             : "border-muted-foreground/30 bg-transparent group-hover:border-muted-foreground/60"
                           )}>
                             {selectedDocId === doc.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                         </div>
                         <span className="truncate flex-1">{doc.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
        </AnimatePresence>

        <div className="text-center mt-4">
          <p className="text-[11px] text-muted-foreground/50 font-medium tracking-wide">
             RAG System v1.0 • Generated content may vary based on source data.
          </p>
        </div>
      </div>
    </main>
  );
}
