"use client";

import { useState, useRef } from "react";
import { useDocuments } from "@/hooks/use-documents";
import { useSidebar } from "@/components/chat/sidebar-context";
import { SettingsNav } from "@/components/dashboard/settings-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PanelRightClose,
  Loader2,
  Search,
  UploadCloud,
  File as FileIcon,
  Trash2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DocumentsPage() {
  const { data: documents = [], isLoading } = useDocuments();
  const { isOpen: isSidebarOpen, toggle: onToggleSidebar } = useSidebar();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Helper functions
  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toUpperCase() || "DOC";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const handleDelete = (id: string) => {
    console.log("Borrar ID:", id);
    // TODO: Implement actual deletion logic
  };

  // Filtering
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (filterType === "all") return matchesSearch;
    const ext = getFileExtension(doc.name).toLowerCase();
    return matchesSearch && ext === filterType.toLowerCase();
  });

  return (
    <div className="max-w-5xl px-4 py-12 md:px-8 lg:py-16 lg:ml-12 xl:ml-24 transition-all duration-300">
      <div className="space-y-6">
        <div className="absolute top-4 left-4 z-10">
          {!isSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="text-muted-foreground hover:bg-muted/50 rounded-lg"
            >
              <PanelRightClose className="w-5 h-5" />
            </Button>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Documentos
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          <aside className="md:w-56 shrink-0">
            <SettingsNav />
          </aside>

          <div className="flex-1 max-w-4xl space-y-8">
            <div>
              <h2 className="text-lg font-medium text-foreground">
                Gestionar documentos
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sube, busca y organiza los documentos que usará el modelo para
                sus respuestas.
              </p>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar documento..."
                  className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-10 px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-colors"
              >
                <option value="all">Todos los tipos</option>
                <option value="pdf">PDF</option>
                <option value="txt">TXT</option>
                <option value="docx">DOCX</option>
                <option value="md">Markdown</option>
              </select>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3",
                isDragging
                  ? "bg-zinc-100 dark:bg-zinc-800/80 border-foreground/50"
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
              )}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <>
                  <FileText className="w-8 h-8 text-foreground/70" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB - Click
                      para cambiar
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-muted-foreground/60" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Arrastra tus documentos aquí, o{" "}
                      <span className="text-blue-500 hover:underline">
                        haz clic para explorar
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Soporta PDF, TXT, DOCX, MD (Max. 10MB)
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Documents Table */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-xs font-medium text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">
                        Nombre de Documento
                      </th>
                      <th className="px-4 py-3 font-medium">Tipo</th>
                      <th className="px-4 py-3 font-medium">Fecha de Subida</th>
                      <th className="px-4 py-3 font-medium">Estado</th>
                      <th className="px-4 py-3 font-medium text-right">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center">
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                        </td>
                      </tr>
                    ) : filteredDocuments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-muted-foreground italic"
                        >
                          No se encontraron documentos.
                        </td>
                      </tr>
                    ) : (
                      filteredDocuments.map((doc) => (
                        <tr
                          key={doc.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <FileIcon className="w-4 h-4 text-muted-foreground/70" />
                              <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-xs">
                                {doc.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 ruploaded_atounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-muted-foreground uppercase">
                              {getFileExtension(doc.name)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatDate(doc.uploaded_at)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              Completado
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="w-8 h-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
