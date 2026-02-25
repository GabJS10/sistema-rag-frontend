"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "General", href: "/dashboard/general" },
  { name: "Documentos", href: "/dashboard/documents" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-zinc-100 dark:bg-zinc-800/60 text-foreground"
                : "text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:text-foreground"
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}