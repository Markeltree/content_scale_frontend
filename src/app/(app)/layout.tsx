"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { Logo } from "@/components/logo";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, loading, apiError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, session, router]);

  if (loading || !session) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r lg:block">
        <AppSidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        {apiError && (
          <div className="flex items-center gap-2 border-b border-amber-300/50 bg-amber-50 px-6 py-2 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
            <CircleAlert className="size-4 shrink-0" />
            <span>
              Backend not reachable: {apiError}. Check <code className="font-mono text-xs">NEXT_PUBLIC_API_URL</code> and that the API is running.
            </span>
          </div>
        )}
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
