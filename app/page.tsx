"use client";
import { useState } from "react";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatArea } from "@/components/chat/chat-area";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen text-white font-sans overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        // Force hidden on mobile to let separate mobile logic work if needed,
        // mostly handled by the component's internal styles
        className="hidden md:flex"
      />

      <ChatArea
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    </div>
  );
}
