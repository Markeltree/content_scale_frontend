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
import { UserAvatar } from "@/components/shared";

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
  for (const g of NAV) for (const i of g.items) if (pathname.startsWith(i.href)) return { ...i, group: g.label };
  return null;
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 shrink-0 items-center px-4">
        <Link href="/dashboard" onClick={onNavigate} className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pt-3 pb-4" aria-label="Main">
        {NAV.map((group) => {
          const items = group.items.filter((i) => !("admin" in i && i.admin) || user?.role === "admin");
          if (!items.length) return null;
          return (
            <div key={group.label}>
              <div className="eyebrow px-2.5 pb-2">{group.label}</div>
              <ul className="space-y-px">
                {items.map((item) => {
                  const active = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group relative flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-xs ring-1 ring-sidebar-border"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        {active && <span className="absolute top-1/2 -left-3 h-4 w-0.75 -translate-y-1/2 rounded-r-full bg-primary" />}
                        <Icon
                          className={cn(
                            "size-4 shrink-0 transition-colors",
                            active ? "text-primary" : "text-muted-foreground/80 group-hover:text-sidebar-accent-foreground"
                          )}
                          strokeWidth={active ? 2.2 : 1.9}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          <span>Powered by Anthropic Claude</span>
        </div>
        <Link
          href="/settings"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-sidebar-accent/70 focus-visible:ring-2 focus-visible:ring-ring outline-none"
        >
          <UserAvatar name={user?.full_name || user?.email} src={user?.avatar_url} className="size-8" />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[13px] font-medium text-sidebar-accent-foreground">{user?.full_name || "User"}</div>
            <div className="truncate text-[11px] text-muted-foreground capitalize">{user?.role ?? "member"}</div>
          </div>
          <Settings className="size-3.5 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
