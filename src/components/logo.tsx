import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25 inset-ring inset-ring-white/15",
        className
      )}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round">
        <path d="M17 7.5A6.5 6.5 0 1 0 17 16.5" />
        <path d="M12 12h6" />
      </svg>
    </div>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {!compact && <span className="text-[15px] font-semibold tracking-[-0.02em]">ContentScale</span>}
    </div>
  );
}
