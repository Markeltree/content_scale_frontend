"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Library, Search, Sparkles, Flag, LayoutGrid, List } from "lucide-react";
import { useApi } from "@/lib/use-api";
import { CONTENT_TYPE_LABELS, STATUSES, STATUS_META, cn } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import type { ContentItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, PageHeader, StatusBadge, UserAvatar } from "@/components/shared";
import { ContentDetail } from "@/components/content-detail";

function LibraryInner() {
  const params = useSearchParams();
  const router = useRouter();
  const lib = useApi<{ items: ContentItem[] }>("/api/content?limit=500");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [view, setView] = useState<"table" | "grid">("table");
  const [openId, setOpenId] = useState<string | null>(params.get("open"));

  useEffect(() => {
    setOpenId(params.get("open"));
  }, [params]);

  const items = lib.data?.items ?? [];
  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          (status === "all" || i.status === status) &&
          (type === "all" || i.type === type) &&
          (!q || `${i.title} ${i.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase()))
      ),
    [items, status, type, q]
  );

  const close = () => {
    setOpenId(null);
    if (params.get("open")) router.replace("/library");
  };

  return (
    <div>
      <PageHeader
        icon={Library}
        title="Content Library"
        description="Every generated and hand-written asset in one searchable place — organized, versioned by status and ready to reuse."
        actions={
          <Button asChild>
            <Link href="/generate">
              <Sparkles /> Generate content
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles & tags" className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_META[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {Object.entries(CONTENT_TYPE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">{filtered.length} items</span>
        <div className="flex rounded-md border p-0.5">
          <Button variant={view === "table" ? "secondary" : "ghost"} size="icon-sm" onClick={() => setView("table")} aria-label="Table view">
            <List />
          </Button>
          <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon-sm" onClick={() => setView("grid")} aria-label="Grid view">
            <LayoutGrid />
          </Button>
        </div>
      </div>

      {lib.loading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : !filtered.length ? (
        <EmptyState icon={Library} title="Nothing here yet" description="Generated content is saved to the library automatically." />
      ) : view === "table" ? (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead className="text-right">Words</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((i) => (
                <TableRow key={i.id} className="cursor-pointer" onClick={() => setOpenId(i.id)}>
                  <TableCell className="max-w-[380px]">
                    <div className="flex items-center gap-2">
                      {i.flagged && <Flag className="size-3.5 shrink-0 text-destructive" />}
                      <span className="truncate font-medium">{i.title}</span>
                      {i.metadata?.generated && <Sparkles className="size-3.5 shrink-0 text-primary" aria-label="AI generated" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{CONTENT_TYPE_LABELS[i.type] ?? i.type}</TableCell>
                  <TableCell>
                    <StatusBadge status={i.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserAvatar name={i.author?.full_name} src={i.author?.avatar_url} className="size-6" />
                      <span className="text-muted-foreground">{i.author?.full_name ?? "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{i.word_count.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{timeAgo(i.updated_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((i) => (
            <button key={i.id} onClick={() => setOpenId(i.id)} className="flex flex-col rounded-xl border bg-card p-5 text-left transition-shadow hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-2">
                <StatusBadge status={i.status} />
                <span className="text-xs text-muted-foreground">{CONTENT_TYPE_LABELS[i.type]}</span>
              </div>
              <div className="mt-3 line-clamp-2 font-semibold">{i.title}</div>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{i.body.replace(/[#*_>`-]/g, "").slice(0, 220)}</p>
              <div className={cn("mt-auto flex items-center gap-2 pt-4 text-xs text-muted-foreground")}>
                <UserAvatar name={i.author?.full_name} className="size-5" /> {i.author?.full_name}
                <span className="ml-auto">{timeAgo(i.updated_at)}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <ContentDetail
        id={openId}
        onClose={close}
        onChanged={(item, deleted) => {
          if (!item) return;
          lib.setData({ items: deleted ? items.filter((i) => i.id !== item.id) : items.map((i) => (i.id === item.id ? { ...i, ...item } : i)) });
        }}
      />
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
      <LibraryInner />
    </Suspense>
  );
}
