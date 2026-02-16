"use client";

import { Sidebar } from "@/components/chat/sidebar";
import { SidebarProvider } from "@/components/chat/sidebar-context";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen text-white font-sans overflow-hidden">
        <Sidebar className="hidden md:flex" />
        {children}
      </div>
    </SidebarProvider>
  );
}
