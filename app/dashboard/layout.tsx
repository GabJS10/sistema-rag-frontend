import { Sidebar } from "@/components/chat/sidebar";
import { SidebarProvider } from "@/components/chat/sidebar-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-zinc-50 dark:bg-background text-zinc-950 dark:text-zinc-50 font-sans overflow-hidden">
        <Sidebar className="hidden md:flex border-r border-zinc-200 dark:border-zinc-800" />
        <main className="flex-1 overflow-y-auto w-full">{children}</main>
      </div>
    </SidebarProvider>
  );
}
