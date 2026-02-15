"use client";

import { Button } from "@/components/ui/button";
import { Plus, Upload, Menu, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Conversation } from "@/lib/types";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  conversations?: Conversation[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  isLoading?: boolean;
}

export function Sidebar({
  isOpen,
  onToggle,
  className,
  conversations = [],
  selectedId,
  onSelect,
  isLoading,
}: SidebarProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen ? (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} // Deceleration easing
          className={cn(
            "bg-background border-r border-white/10 flex flex-col overflow-hidden whitespace-nowrap z-20",
            className,
          )}
        >
          <div className="flex flex-col h-full w-[280px]">
            {/* Header with Toggle */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-sm bg-zinc-800 border border-white/10" />
                <span className="text-sm font-medium tracking-tight">
                  INTEL_CONSOLE
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="text-zinc-500 hover:text-white hover:bg-zinc-900 h-8 w-8"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-3 gap-2 flex flex-col">
              {/* Main Actions */}
              <Button
                variant="outline"
                className="justify-start gap-3 text-zinc-300 hover:bg-zinc-900 hover:text-white w-full h-10 border-dashed border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium text-xs uppercase tracking-wider">
                  New Operation
                </span>
              </Button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-hidden overflow-y-auto">
              <div className="px-4 py-2">
                <p className="text-[10px] font-mono uppercase text-zinc-600 mb-2 tracking-widest">
                  Archives
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="px-4 py-2 text-xs text-zinc-500 font-mono">
                  No archives found.
                </div>
              ) : (
                <div className="px-2 space-y-1">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => onSelect?.(conv.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-sm group transition-colors border flex items-center gap-2",
                        selectedId === conv.id
                          ? "bg-zinc-900 border-zinc-800 text-white"
                          : "hover:bg-zinc-900/50 border-transparent hover:border-zinc-800/50 text-zinc-400",
                      )}
                    >
                      <div
                        className={cn(
                          "w-1 h-1 rounded-full transition-colors",
                          selectedId === conv.id
                            ? "bg-emerald-500"
                            : "bg-zinc-700 group-hover:bg-zinc-500",
                        )}
                      />
                      <div className="flex flex-col gap-0.5 w-full overflow-hidden">
                        <span
                          className={cn(
                            "text-xs font-medium truncate",
                            selectedId === conv.id
                              ? "text-emerald-400"
                              : "text-zinc-300 group-hover:text-white",
                          )}
                        >
                          {conv.title || "Untitled Operation"}
                        </span>
                        <span className="text-[10px] text-zinc-600 font-mono">
                          {new Date(conv.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="mt-auto p-3 border-t border-white/5 bg-zinc-950/30">
              <div className="flex items-center gap-3 p-2 rounded-sm hover:bg-zinc-900 cursor-pointer transition-colors border border-transparent hover:border-zinc-800">
                <div className="w-8 h-8 rounded-sm bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-400">
                  GB
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-medium text-zinc-200">
                    Gabriel Ball...
                  </span>
                  <span className="text-[10px] text-emerald-500 font-mono uppercase">
                    {" "}
                    clearance: lvl 4
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
