"use client";

import { Button } from "@/components/ui/button";
import { Plus, PanelLeftClose, Loader2, MessageSquare, Settings, LogOut, Clock, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useConversations } from "@/hooks/use-chat-query";
import { useParams, useRouter } from "next/navigation";
import { useSidebar } from "@/components/chat/sidebar-context";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { isOpen, toggle } = useSidebar();
  const { data: conversations = [], isLoading } = useConversations();
  const params = useParams();
  const router = useRouter();

  const selectedId = params?.id as string;

  const handleSelect = (id: string) => {
    router.push(`/chat/${id}`);
  };

  const handleNewChat = () => {
    router.push("/chat");
  };

  return (
    <AnimatePresence initial={false}>
      {isOpen ? (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "bg-zinc-50 dark:bg-zinc-950 border-r border-border/40 flex flex-col overflow-hidden whitespace-nowrap z-20 h-full",
            className
          )}
        >
          <div className="flex flex-col h-full w-[260px]">
            {/* Header */}
            <div className="flex items-center justify-between px-3 pt-4 pb-2">
               <div className="flex items-center gap-2 px-2">
                  <div className="w-5 h-5 bg-foreground rounded-full flex items-center justify-center">
                     <div className="w-2 h-2 bg-background rounded-full" />
                  </div>
                  <span className="text-sm font-semibold tracking-tight text-foreground">RAG Protocol</span>
               </div>
               
               <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={toggle}
                  className="text-muted-foreground hover:text-foreground w-7 h-7"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </Button>
            </div>

            <div className="px-3 pb-2 pt-4">
              <Button
                onClick={handleNewChat}
                className="w-full justify-start gap-2 shadow-sm bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all h-9"
                size="sm"
              >
                <Plus className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">New Session</span>
              </Button>
            </div>

            {/* Research Log */}
            <div className="flex-1 overflow-hidden overflow-y-auto px-3 py-4">
              <div className="space-y-6">
                
                {/* Group: Today */}
                <div className="space-y-1">
                  <div className="px-2 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <Clock className="w-3 h-3" />
                     Recent Activity
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/30" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="px-2 py-1 text-xs text-muted-foreground/40 italic">
                      No logs found.
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => handleSelect(conv.id)}
                        className={cn(
                          "w-full text-left px-2 py-1.5 rounded-md group transition-all flex items-center gap-2 relative",
                          selectedId === conv.id
                            ? "bg-zinc-100 dark:bg-zinc-800/80 text-foreground font-medium"
                            : "text-muted-foreground/70 hover:text-foreground hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30"
                        )}
                      >
                        {selectedId === conv.id && (
                           <motion.div 
                              layoutId="active-nav"
                              className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-foreground rounded-full"
                           />
                        )}
                        <span className={cn(
                           "text-[13px] truncate leading-snug w-full transition-all",
                           selectedId === conv.id ? "pl-2" : "pl-0"
                        )}>
                          {conv.title || "Untitled Session"}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer / Profile */}
            <div className="p-3 mt-auto border-t border-border/20 bg-background/50 backdrop-blur-sm">
              <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 border border-black/5 dark:border-white/5 shadow-sm" />
                <div className="flex flex-col text-left flex-1 min-w-0">
                  <span className="text-xs font-medium text-foreground truncate">
                    Gabriel B.
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate group-hover:text-foreground transition-colors">
                    Pro Workspace
                  </span>
                </div>
                <Settings className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
              </button>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
