"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ChevronRight, LogOut, Menu, Moon, Settings, Sun, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { initials } from "@/lib/utils";
import { AppSidebar, findNav } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const current = findNav(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md supports-backdrop-filter:bg-background/70 md:px-6">
      <Button variant="ghost" size="icon-sm" className="-ml-1 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AppSidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1.5 text-[13px]">
        <span className="hidden text-muted-foreground sm:inline">{current?.group ?? "Workspace"}</span>
        <ChevronRight className="hidden size-3.5 text-muted-foreground/60 sm:block" />
        <span className="truncate font-medium text-foreground">{current?.label ?? "ContentScale"}</span>
      </nav>

      <Button asChild size="sm" className="hidden sm:inline-flex">
        <Link href="/generate">
          <Sparkles /> Create
        </Link>
      </Button>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Toggle theme"
            className="text-muted-foreground"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? <Sun /> : <Moon />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{resolvedTheme === "dark" ? "Light mode" : "Dark mode"}</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="ml-1 flex cursor-pointer items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Account menu"
          >
            <Avatar className="size-8 ring-1 ring-border">
              {user?.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
              <AvatarFallback className="text-[11px] font-medium">{initials(user?.full_name || user?.email)}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{user?.full_name || "User"}</div>
                <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
              </div>
              <Badge variant="soft" className="capitalize">
                {user?.role}
              </Badge>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings /> Settings
            </Link>
          </DropdownMenuItem>
          {user?.role === "admin" && (
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <ShieldCheck /> Admin dashboard
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              await signOut();
              router.replace("/login");
            }}
          >
            <LogOut /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
