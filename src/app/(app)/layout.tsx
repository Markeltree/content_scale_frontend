"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { LogoMark } from "@/components/logo";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, loading, apiError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, session, router]);

  if (loading || !session) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <div className="flex flex-col items-center gap-5">
          <LogoMark className="size-10 rounded-xl" />
          <div className="h-0.5 w-32 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/3 animate-[loader_1.1s_ease-in-out_infinite] rounded-full bg-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-sidebar-border lg:block">
        <AppSidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        {apiError && (
          <div role="alert" className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-50 px-4 py-2 text-[13px] text-amber-900 md:px-6 dark:bg-amber-500/10 dark:text-amber-200">
            <CircleAlert className="size-4 shrink-0" />
            <span>
              Backend not reachable: {apiError}. Check <code className="rounded bg-amber-500/10 px-1 font-mono text-xs">NEXT_PUBLIC_API_URL</code> and that the API is running.
            </span>
          </div>
        )}
        <main className="flex-1 px-4 py-6 sm:px-6 md:py-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1320px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
