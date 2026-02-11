"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Menu, Mic, Send, FileText, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface ChatAreaProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

// Mock documents
const MOCK_DOCS = [
  { id: 1, name: "Reporte_Financiero_2024.pdf" },
  { id: 2, name: "Analisis_De_Mercado.docx" },
  { id: 3, name: "Presentacion_Q1.pptx" },
  { id: 4, name: "Datos_Usuarios.csv" },
];

export function ChatArea({ isSidebarOpen, onToggleSidebar }: ChatAreaProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleDoc = (id: number) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    );
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
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
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
                 <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Console_Active</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Header (Simplified for this component, assuming parent handles layout flexibility) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-background border-b border-white/5 text-white absolute w-full top-0 left-0 z-0">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <Menu className="w-5 h-5" />
        </Button>
        <span className="font-mono text-xs uppercase tracking-widest">Intel_Core</span>
        <div className="w-6" />
      </div>

      {/* Center Content with Entrance Animation */}
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
                <div className="w-2 h-2 bg-emerald-500 rounded-sm animate-pulse" />
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
              Awaiting query parameters...
            </p>
          </div>
        </div>
      </motion.div>

      {/* Input Area */}
      <div className="w-full max-w-3xl mx-auto px-4 pb-6 md:pb-8 z-10">
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
                    {selectedDocs.length} selected
                   </div>
                </div>
                
                <div
                  className="flex flex-col max-h-56 overflow-y-auto p-1"
                  ref={dropdownRef}
                >
                  {MOCK_DOCS.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm text-left transition-all border border-transparent",
                        selectedDocs.includes(doc.id)
                          ? "bg-zinc-900 border-zinc-800 text-white"
                          : "hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      <div
                        className={cn(
                          "w-3 h-3 border flex items-center justify-center shrink-0 transition-colors",
                          selectedDocs.includes(doc.id)
                            ? "bg-emerald-500 border-emerald-500 text-black"
                            : "border-zinc-700 bg-transparent"
                        )}
                      >
                         {/* Checkbox visual is handled by bg color above mostly */}
                      </div>
                      <span className="truncate font-mono text-xs">{doc.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="relative flex flex-col bg-zinc-950 border border-zinc-800 focus-within:border-zinc-600 transition-colors shadow-lg">
             <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-900">
                <div className="flex gap-2">
                    <Button
                    onClick={() => {
                        setIsDropdownOpen(!isDropdownOpen);
                    }}
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "h-6 px-2 text-[10px] font-mono uppercase tracking-wide gap-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-sm border border-transparent hover:border-zinc-800 transition-all",
                        isDropdownOpen && "bg-zinc-900 text-white border-zinc-800",
                         selectedDocs.length > 0 && "text-emerald-500"
                    )}
                    >
                    <Plus className="w-3 h-3" />
                    {selectedDocs.length > 0 ? "Context Active" : "Add Context"}
                    </Button>
                </div>
             </div>
             
             <div className="relative">
                <Textarea 
                    placeholder="Enter command or query..." 
                    className="min-h-[60px] w-full resize-none bg-transparent border-none text-sm p-4 focus-visible:ring-0 placeholder:text-zinc-600 font-normal"
                />
                
                <div className="absolute bottom-3 right-3 flex items-center gap-1">
                 <Button
                    size="icon"
                    className="h-7 w-7 rounded-sm bg-white text-black hover:bg-zinc-200 transition-colors"
                >
                    <Send className="w-3 h-3" />
                </Button>
                </div>
             </div>
          </div>
          
          <div className="flex justify-between items-center px-1">
             <div className="flex gap-4">
                 <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-900/50 border border-emerald-500/50"></div>
                    SYSTEM_ONLINE
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
