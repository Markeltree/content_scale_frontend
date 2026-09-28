import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-rose-400 text-white shadow-sm shadow-primary/30">
        <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
          <path d="M17 7.5A6.5 6.5 0 1 0 17 16.5" />
          <path d="M12 12h6" />
        </svg>
      </div>
      {!compact && (
        <div className="leading-none">
          <div className="text-[15px] font-bold tracking-tight">
            Content<span className="text-primary">Scale</span>
          </div>
          <div className="mt-0.5 text-[9px] font-medium tracking-[0.2em] text-muted-foreground uppercase">Generative AI</div>
        </div>
      )}
    </div>
  );
}
