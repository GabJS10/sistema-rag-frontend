"use client";

import { Button } from "@/components/ui/button";
import {
  Plus,
  PanelLeftClose,
  Loader2,
  Settings,
  LogOut,
  Clock,
  User,
  FileText,
  Moon,
  Sun,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useConversations } from "@/hooks/use-chat-query";
import { useParams, useRouter } from "next/navigation";
import { useSidebar } from "@/components/chat/sidebar-context";
import { useUser } from "@/hooks/use-user";
import { useTheme } from "next-themes";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { isOpen, toggle } = useSidebar();
  const { data: conversations = [], isLoading } = useConversations();
  const { data: user, isLoading: isLoadingUser } = useUser();
  const params = useParams();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedId = params?.id as string;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleSelect = (id: string) => {
    router.push(`/chat/${id}`);
  };

  const handleNewChat = () => {
    router.push("/chat");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.refresh();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const handleManageDocuments = () => {
    toast.info("Document management coming soon");
    setIsMenuOpen(false);
  };

  const handleUpdateProfile = () => {
    toast.info("Profile update coming soon");
    setIsMenuOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
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
            "bg-zinc-50 dark:bg-zinc-950/50 backdrop-blur-xl  flex flex-col overflow-hidden whitespace-nowrap z-20 h-full",
            className,
          )}
        >
          <div className="flex flex-col h-full w-[260px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-6 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-foreground rounded-xl flex items-center justify-center shadow-sm">
                  <div className="w-3 h-3 bg-background rounded-full" />
                </div>
                <span className="text-sm font-bold tracking-tight text-foreground">
                  RAG Protocol
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggle}
                className="text-muted-foreground hover:text-foreground w-8 h-8 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
              >
                <PanelLeftClose className="w-4 h-4" />
              </Button>
            </div>

            <div className="px-4 pb-4 pt-4">
              <Button
                onClick={handleNewChat}
                className="w-full justify-start gap-2 shadow-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all h-10 rounded-xl px-4"
                size="sm"
              >
                <Plus className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">New Session</span>
              </Button>
            </div>

            {/* Research Log */}
            <div className="flex-1 overflow-hidden overflow-y-auto px-2 py-2">
              <div className="space-y-6">
                {/* Group: Today */}
                <div className="space-y-1">
                  <div className="px-3 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Recent Activity
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/30" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="px-3 py-1 text-xs text-muted-foreground/40 italic">
                      No logs found.
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => handleSelect(conv.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg group transition-all flex items-center gap-2 relative",
                          selectedId === conv.id
                            ? "bg-zinc-200/50 dark:bg-zinc-800/60 text-foreground font-medium"
                            : "text-muted-foreground/70 hover:text-foreground hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30",
                        )}
                      >
                        {selectedId === conv.id && (
                          <motion.div
                            layoutId="active-nav"
                            className="absolute left-0 top-2 bottom-2 w-0.5 bg-foreground rounded-full"
                          />
                        )}
                        <span
                          className={cn(
                            "text-[13px] truncate leading-snug w-full transition-all",
                            selectedId === conv.id ? "pl-2" : "pl-0",
                          )}
                        >
                          {conv.title || "Untitled Session"}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer / Profile */}
            <div className="p-3 mt-auto bg-background/30 backdrop-blur-md relative">
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full left-3 right-3 mb-2 bg-zinc-950/50 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden z-30 ring-1 ring-black/5 flex flex-col p-1"
                  >
                    <div className="px-3 py-2 ">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user?.nombre || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        Free Plan
                      </p>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <button
                        onClick={handleManageDocuments}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-foreground/80 hover:bg-zinc-950 hover:text-accent-foreground rounded-lg transition-colors text-left "
                      >
                        <FileText className="w-4 h-4" />
                        Gestionar documentos
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-foreground/80 hover:bg-zinc-950 hover:text-accent-foreground rounded-lg transition-colors text-left"
                      >
                        <User className="w-4 h-4" />
                        Actualizar datos
                      </button>
                    </div>

                    <div className="h-px bg-border/40 my-1" />

                    <div className="p-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                ref={buttonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors group"
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.nombre}
                    className="w-8 h-8 rounded-full border border-black/5 dark:border-white/5 shadow-sm ring-2 ring-background object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 border border-black/5 dark:border-white/5 shadow-sm ring-2 ring-background flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-200">
                    {user?.nombre ? getInitials(user.nombre) : "U"}
                  </div>
                )}

                <div className="flex flex-col text-left flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">
                    {isLoadingUser ? "Loading..." : user?.nombre || "User"}
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
