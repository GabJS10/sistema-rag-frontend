"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Menu, Mic, Send, FileText, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

  const toggleDoc = (id: number) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    );
  };

  return (
    <main className="flex-1 flex flex-col relative bg-black overflow-hidden">
      {/* Header / Toggle for Desktop (when sidebar closed) or Mobile */}
      <div className="absolute top-4 left-4 z-10">
        {!isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="text-zinc-400 hover:text-white hover:bg-zinc-900"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </motion.div>
        )}

        {/* Mobile Toggle (Always show if desktop hidden logic is handled elsewhere, 
            but for now we assume this component is used in a layout where mobile might need its own trigger. 
            However, the main layout usually handles mobile sidebar sheet. 
            Let's keep this simple: if sidebar is closed, show toggle. 
            On mobile, sidebar is usually hidden by default. 
            We'll stick to the requested "desktop toggle" behavior for now and let the parent handle mobile responsiveness if needed.) 
        */}
      </div>

      {/* Mobile Header (Simplified for this component, assuming parent handles layout flexibility) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-black text-white absolute w-full top-0 left-0 z-0">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <Menu className="w-6 h-6" />
        </Button>
        <span className="font-medium">Chat</span>
        <div className="w-6" />
      </div>

      {/* Center Content with Entrance Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex-1 flex flex-col items-center justify-center p-4"
      >
        <div className="flex flex-col items-center justify-center gap-1 mb-12">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10">
            <div className="w-8 h-8 rounded-full bg-white shadow-lg shadow-white/20" />
          </div>
          <h1 className="text-3xl md:text-4xl font-medium text-white text-center tracking-tight">
            ¿Qué toca hoy?
          </h1>
        </div>
      </motion.div>

      {/* Input Area */}
      <div className="w-full max-w-3xl mx-auto px-4 pb-6 md:pb-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative group"
        >
          {/* File Selection Dropdown */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 mb-4 bg-[#1a1a1a] border border-white/10 rounded-2xl w-64 p-2 shadow-2xl overflow-hidden z-20"
              >
                <div className="text-xs font-medium text-zinc-400 px-2 py-2 border-b border-white/5 mb-1">
                  Seleccionar contexto
                </div>
                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                  {MOCK_DOCS.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg text-sm text-left transition-colors",
                        selectedDocs.includes(doc.id)
                          ? "bg-zinc-800 text-white"
                          : "hover:bg-zinc-800/50 text-zinc-300"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                          selectedDocs.includes(doc.id)
                            ? "bg-white border-white text-black"
                            : "border-zinc-600"
                        )}
                      >
                        {selectedDocs.includes(doc.id) && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                      <FileText className="w-4 h-4 text-zinc-500" />
                      <span className="truncate">{doc.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative flex items-center gap-2 bg-transparent rounded-[26px] p-2 pl-4 shadow-2xl transition-colors group-hover:border-white/20">
            <Input placeholder="Pregunta lo que quieras" />

            <div className="flex items-center gap-1 pr-1">
              <div className="hidden md:flex">
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-zinc-400 hover:text-white h-9 w-9"
                >
                  <Mic className="w-5 h-5" />
                </Button>
              </div>

              <Button
                size="icon"
                className="h-9 w-9 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2 mt-4 justify-center md:justify-start">
            <Button
              onClick={() => {
                console.log("hola");

                setIsDropdownOpen(!isDropdownOpen);
              }}
              className={cn(
                "rounded-full border-zinc-700 bg-transparent text-white hover:bg-zinc-800 hover:text-white text-xs h-8 px-4 font-normal transition-colors",
                isDropdownOpen && "bg-zinc-800 text-white border-zinc-600"
              )}
            >
              <Plus className="w-3.5 h-3.5 mr-2" />
              {selectedDocs.length > 0
                ? `${selectedDocs.length} archivo(s) seleccionado(s)`
                : "Seleccionar archivos"}
            </Button>
          </div>

          <div className="mt-3 text-center">
            <p className="text-[10px] text-white">
              El sistema puede cometer errores. Considera verificar la
              información importante.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
