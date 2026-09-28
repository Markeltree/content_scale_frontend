"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  PenLine,
  ImagePlus,
  FileSearch,
  BookOpen,
  Braces,
  SquareKanban,
  Library,
  ChartColumn,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { useAuth } from "@/lib/auth";

export const NAV = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/analytics", label: "Analytics", icon: ChartColumn },
    ],
  },
  {
    label: "Create",
    items: [
      { href: "/generate", label: "Content Generation", icon: Sparkles },
      { href: "/assistant", label: "Writing Assistant", icon: PenLine },
      { href: "/images", label: "Image Studio", icon: ImagePlus },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/documents", label: "Document Intelligence", icon: FileSearch },
      { href: "/knowledge", label: "Knowledge Base", icon: BookOpen },
    ],
  },
  {
    label: "Workspace",
    items: [
      { href: "/prompts", label: "Prompt Workspace", icon: Braces },
      { href: "/workflow", label: "Workflow & Approvals", icon: SquareKanban },
      { href: "/library", label: "Content Library", icon: Library },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/admin", label: "Admin Dashboard", icon: ShieldCheck, admin: true },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function findNav(pathname: string) {
  for (const g of NAV) for (const i of g.items) if (pathname.startsWith(i.href)) return i;
  return null;
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center px-5">
        <Link href="/dashboard" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>
      <nav className="scrollbar-thin flex-1 space-y-5 overflow-y-auto px-3 py-2">
        {NAV.map((group) => {
          const items = group.items.filter((i) => !("admin" in i && i.admin) || user?.role === "admin");
          if (!items.length) return null;
          return (
            <div key={group.label}>
              <div className="px-3 pb-1.5 text-[11px] font-medium tracking-wider text-muted-foreground/80 uppercase">{group.label}</div>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        )}
                      >
                        <Icon className={cn("size-4", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
      <div className="m-3 rounded-xl border bg-gradient-to-br from-primary/10 via-background to-background p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4 text-primary" /> Powered by Claude
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Generation, RAG and document analysis run on Anthropic models.</p>
      </div>
    </div>
  );
}
