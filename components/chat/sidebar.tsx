"use client";

import { Button } from "@/components/ui/button";
import { Plus, Upload, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function Sidebar({ isOpen, onToggle, className }: SidebarProps) {
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
            className
          )}
        >
          <div className="flex flex-col h-full w-[280px]">
            {/* Header with Toggle */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                 <div className="h-6 w-6 rounded-sm bg-zinc-800 border border-white/10" />
                 <span className="text-sm font-medium tracking-tight">INTEL_CONSOLE</span>
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
              <span className="font-medium text-xs uppercase tracking-wider">New Operation</span>
            </Button>
            </div>

            {/* Previous Chats (Mock) */}
            <div className="flex-1 overflow-hidden">
               <div className="px-4 py-2">
                 <p className="text-[10px] font-mono uppercase text-zinc-600 mb-2 tracking-widest">Archives</p>
               </div>
               {/* Scroll Area would go here */}
               <div className="px-2 space-y-1">
                {[1, 2, 3].map((_, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-3 py-2 rounded-sm hover:bg-zinc-900/50 group transition-colors border border-transparent hover:border-zinc-800/50 flex items-center gap-2"
                  >
                    <div className="w-1 h-1 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors" />
                     <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-zinc-300 group-hover:text-emerald-400 font-medium truncate">Investigation #{1024 + i}</span>
                        <span className="text-[10px] text-zinc-600 font-mono">2024-02-11 14:32</span>
                     </div>
                  </button>
                ))}
              </div>
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
                  <span className="text-[10px] text-emerald-500 font-mono uppercase"> clearance: lvl 4</span>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
