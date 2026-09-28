"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Download, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { cn, initials, STATUS_META } from "@/lib/utils";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  hint,
  className,
}: {
  label: string;
  value: React.ReactNode;
  change?: number;
  icon?: LucideIcon;
  hint?: string;
  className?: string;
}) {
  const up = (change ?? 0) >= 0;
  return (
    <Card className={cn("gap-3 p-5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon && (
          <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold tracking-tight tabular-nums">{value}</div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {change !== undefined && (
          <span className={cn("inline-flex items-center gap-0.5 font-medium", up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600")}>
            {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {up ? "+" : ""}
            {change}%
          </span>
        )}
        {hint}
      </div>
    </Card>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-14 text-center", className)}>
      <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const m = STATUS_META[status] ?? STATUS_META.draft;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", m.className, className)}>
      <span className={cn("size-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

export function UserAvatar({ name, src, className }: { name?: string | null; src?: string | null; className?: string }) {
  return (
    <Avatar className={cn("size-7", className)}>
      {src && <AvatarImage src={src} alt="" />}
      <AvatarFallback className="text-[10px]">{initials(name)}</AvatarFallback>
    </Avatar>
  );
}

export function Markdown({ children, className, streaming }: { children: string; className?: string; streaming?: boolean }) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-h1:text-2xl prose-a:text-primary prose-strong:text-foreground prose-table:text-sm prose-th:text-left",
        streaming && "[&>*:last-child]:stream-caret",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}

export function CopyButton({ text, label, size = "sm", variant = "outline" }: { text: string; label?: string; size?: "sm" | "icon-sm"; variant?: "outline" | "ghost" }) {
  const [done, setDone] = useState(false);
  const btn = (
    <Button
      variant={variant}
      size={label ? size : "icon-sm"}
      disabled={!text}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? <Check /> : <Copy />}
      {label && (done ? "Copied" : label)}
    </Button>
  );
  if (label) return btn;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{btn}</TooltipTrigger>
      <TooltipContent>Copy</TooltipContent>
    </Tooltip>
  );
}

export function downloadText(filename: string, text: string, type = "text/markdown") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function DownloadButton({ filename, text }: { filename: string; text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon-sm" disabled={!text} onClick={() => downloadText(filename, text)}>
          <Download />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Download .md</TooltipContent>
    </Tooltip>
  );
}

type Model = { id: string; name: string; tier?: string; is_default?: boolean };
let modelsCache: Model[] | null = null;

export function ModelSelect({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  const [models, setModels] = useState<Model[]>(modelsCache ?? []);
  useEffect(() => {
    if (modelsCache) return;
    api<{ models: Model[] }>("/api/settings/models")
      .then(({ models }) => {
        modelsCache = models;
        setModels(models);
      })
      .catch(() => {});
  }, []);
  return (
    <Select value={value || "default"} onValueChange={(v) => onChange(v === "default" ? "" : v)}>
      <SelectTrigger className={cn("w-full", className)} size="sm">
        <SelectValue placeholder="Model" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">Workspace default</SelectItem>
        {models.map((m) => (
          <SelectItem key={m.id} value={m.id}>
            {m.name}
            {m.tier ? <span className="text-muted-foreground"> · {m.tier}</span> : null}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-medium">{label}</label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function GeneratingDots({ label = "Generating" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </span>
      {label}
    </div>
  );
}
