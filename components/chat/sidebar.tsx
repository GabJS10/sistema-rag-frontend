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
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={cn(
            "bg-black border-r border-white/10 flex flex-col overflow-hidden whitespace-nowrap",
            className
          )}
        >
          <div className="flex flex-col h-full p-3 gap-2 w-65">
            {/* Header with Toggle */}
            <div className="flex items-center justify-between px-2 py-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-zinc-800" />
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="text-zinc-400 hover:text-white hover:bg-zinc-900"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>

            {/* Main Actions */}
            <Button
              variant="ghost"
              className="justify-start gap-3 text-zinc-100 hover:bg-zinc-900 hover:text-white w-full h-12 mb-1"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full border border-zinc-500">
                <Plus className="w-4 h-4" />
              </div>
              <span className="font-light">Nuevo Chat</span>
            </Button>

            <Button
              variant="ghost"
              className="justify-start gap-3 text-zinc-100 hover:bg-zinc-900 hover:text-white w-full h-12"
            >
              <div className="flex items-center justify-center w-6 h-6">
                <Upload className="w-5 h-5" />
              </div>
              <span className="font-light">Subir Archivo</span>
            </Button>

            {/* Previous Chats (Mock) */}
            <div className="mt-8 px-2 flex-1 overflow-y-auto">
              <p className="text-xs font-medium text-zinc-400 mb-4 pl-1">
                Chats Anteriores
              </p>
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-zinc-900/50 rounded-full w-full overflow-hidden"
                  >
                    <div className="h-full bg-zinc-800/20 w-3/4 animate-pulse rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* User Profile */}
            <div className="mt-auto p-2">
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 cursor-pointer transition-colors">
                <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-xs font-bold text-white">
                  GB
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium text-zinc-100">
                    Gabriel Ball...
                  </span>
                  <span className="text-xs text-zinc-400">Gratis</span>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
