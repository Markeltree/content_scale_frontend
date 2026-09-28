"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { format, isPast, parseISO } from "date-fns";
import { SquareKanban, Plus, Search, MessageSquare, Calendar, Flag, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { useAuth } from "@/lib/auth";
import { CONTENT_TYPE_LABELS, STATUSES, STATUS_META, cn } from "@/lib/utils";
import type { ContentItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, PageHeader, UserAvatar } from "@/components/shared";
import { ContentDetail, useTeam } from "@/components/content-detail";

const PRIORITY_DOT: Record<string, string> = { high: "bg-rose-500", medium: "bg-amber-400", low: "bg-zinc-300 dark:bg-zinc-600" };

function BoardCard({ item, onOpen, onDragStart }: { item: ContentItem; onOpen: () => void; onDragStart: (e: React.DragEvent) => void }) {
  const overdue = item.due_date && !["published", "scheduled"].includes(item.status) && isPast(parseISO(item.due_date));
  const comments = item.comments?.[0]?.count ?? 0;
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onOpen}
      className="group cursor-grab rounded-xl border bg-card p-3.5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{CONTENT_TYPE_LABELS[item.type] ?? item.type}</span>
        {item.flagged && <Flag className="size-3 text-destructive" />}
        <span className={cn("ml-auto size-2 rounded-full", PRIORITY_DOT[item.priority])} title={`${item.priority} priority`} />
      </div>
      <div className="mt-2 line-clamp-2 text-sm leading-snug font-medium">{item.title}</div>
      <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
        {item.due_date && (
          <span className={cn("flex items-center gap-1", overdue && "font-medium text-rose-600")}>
            <Calendar className="size-3" />
            {format(parseISO(item.due_date), "MMM d")}
          </span>
        )}
        {comments > 0 && (
          <span className="flex items-center gap-1">
            <MessageSquare className="size-3" /> {comments}
          </span>
        )}
        <span>{item.word_count.toLocaleString()}w</span>
        <span className="ml-auto">{item.assignee ? <UserAvatar name={item.assignee.full_name} src={item.assignee.avatar_url} className="size-5" /> : null}</span>
      </div>
    </div>
  );
}

export default function WorkflowPage() {
  const { user } = useAuth();
  const canWrite = user?.role !== "viewer";
  const team = useTeam();
  const board = useApi<{ items: ContentItem[] }>("/api/content?limit=500");
  const [openId, setOpenId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [mine, setMine] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ title: "", type: "blog_post", channel: "", priority: "medium", due_date: "", assignee_id: "", body: "" });

  const items = board.data?.items ?? [];
  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          (type === "all" || i.type === type) &&
          (!mine || i.assignee_id === user?.id || i.user_id === user?.id) &&
          (!q || i.title.toLowerCase().includes(q.toLowerCase()))
      ),
    [items, type, mine, q, user]
  );

  const move = async (id: string, status: string) => {
    const prev = items;
    const item = items.find((i) => i.id === id);
    if (!item || item.status === status) return;
    board.setData({ items: items.map((i) => (i.id === id ? { ...i, status } : i)) });
    try {
      await api(`/api/content/${id}`, { method: "PATCH", body: { status } });
      toast.success(`Moved to ${STATUS_META[status].label}`);
    } catch (e: any) {
      board.setData({ items: prev });
      toast.error(e.message);
    }
  };

  const create = async () => {
    try {
      const { item } = await api<{ item: ContentItem }>("/api/content", { body: { ...draft, assignee_id: draft.assignee_id || null, due_date: draft.due_date || null } });
      board.setData({ items: [item, ...items] });
      setCreating(false);
      setDraft({ title: "", type: "blog_post", channel: "", priority: "medium", due_date: "", assignee_id: "", body: "" });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <PageHeader
        icon={SquareKanban}
        title="Content Workflow & Approvals"
        description="Every piece of content on one board — from draft through review and approval to scheduled and published."
        actions={
          canWrite && (
            <Button onClick={() => setCreating(true)}>
              <Plus /> New item
            </Button>
          )
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles" className="pl-9" />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All content types</SelectItem>
            {Object.entries(CONTENT_TYPE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm">
          <Switch checked={mine} onCheckedChange={setMine} /> My items
        </label>
        {user?.role !== "admin" && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> Approvers move items to Approved and beyond
          </span>
        )}
      </div>

      {board.loading ? (
        <div className="grid grid-cols-6 gap-3">
          {STATUSES.map((s) => (
            <Skeleton key={s} className="h-96 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 pb-4 md:-mx-8 md:px-8">
          <div className="grid min-w-[1080px] grid-cols-6 gap-2.5">
            {STATUSES.map((status) => {
              const col = filtered.filter((i) => i.status === status);
              const meta = STATUS_META[status];
              return (
                <div
                  key={status}
                  onDragOver={(e) => {
                    if (!canWrite) return;
                    e.preventDefault();
                    setDragOver(status);
                  }}
                  onDragLeave={() => setDragOver((d) => (d === status ? null : d))}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(null);
                    const id = e.dataTransfer.getData("text/plain");
                    if (id) move(id, status);
                  }}
                  className={cn("flex min-h-[560px] flex-col rounded-2xl border bg-muted/40 p-2.5 transition-colors", dragOver === status && "border-primary/50 bg-primary/5")}
                >
                  <div className="flex items-center gap-2 px-1.5 pt-1 pb-3">
                    <span className={cn("size-2 rounded-full", meta.dot)} />
                    <span className="text-sm font-semibold">{meta.label}</span>
                    <span className="ml-auto rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground tabular-nums">{col.length}</span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2.5">
                    {col.map((item) => (
                      <BoardCard key={item.id} item={item} onOpen={() => setOpenId(item.id)} onDragStart={(e) => e.dataTransfer.setData("text/plain", item.id)} />
                    ))}
                    {!col.length && <div className="grid flex-1 place-items-center rounded-xl border border-dashed text-xs text-muted-foreground">Drop items here</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ContentDetail
        id={openId}
        onClose={() => setOpenId(null)}
        onChanged={(item, deleted) => {
          if (!item) return;
          board.setData({ items: deleted ? items.filter((i) => i.id !== item.id) : items.map((i) => (i.id === item.id ? { ...i, ...item } : i)) });
        }}
      />

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>New content item</DialogTitle>
            <DialogDescription>Plan work on the board. You can draft the body now or generate it later.</DialogDescription>
          </DialogHeader>
          <Field label="Title">
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Q4 launch blog post" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONTENT_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Channel">
              <Input value={draft.channel} onChange={(e) => setDraft({ ...draft, channel: e.target.value })} placeholder="Blog, LinkedIn…" />
            </Field>
            <Field label="Priority">
              <Select value={draft.priority} onValueChange={(v) => setDraft({ ...draft, priority: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Due date">
              <Input type="date" value={draft.due_date} onChange={(e) => setDraft({ ...draft, due_date: e.target.value })} />
            </Field>
          </div>
          <Field label="Assignee">
            <Select value={draft.assignee_id || "none"} onValueChange={(v) => setDraft({ ...draft, assignee_id: v === "none" ? "" : v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {team.map((m) => (
                  <SelectItem key={m.id} value={m.id!}>
                    {m.full_name || m.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Body" hint="optional, Markdown">
            <Textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} className="min-h-24" />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button onClick={create} disabled={!draft.title.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
