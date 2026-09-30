"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Eye, Pencil, Send, Trash2, WandSparkles, LoaderCircle, Save, CircleCheck, CircleAlert, Flag, MessageSquare, History } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { CONTENT_TYPE_LABELS, STATUSES, STATUS_META, cn } from "@/lib/utils";
import { describeActivity, timeAgo } from "@/lib/format";
import type { Activity, ContentItem, Person } from "@/lib/types";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CopyButton, DownloadButton, Markdown, StatusBadge, UserAvatar } from "@/components/shared";

type Comment = { id: string; body: string; created_at: string; author: Person | null };
type Review = { score: number; verdict: string; strengths: string[]; issues: string[]; suggestions: string[]; readability: string; brand_fit: string };

let teamCache: Person[] | null = null;
export function useTeam() {
  const [team, setTeam] = useState<Person[]>(teamCache ?? []);
  useEffect(() => {
    if (teamCache) return;
    api<{ team: Person[] }>("/api/me/team")
      .then((r) => {
        teamCache = r.team;
        setTeam(r.team);
      })
      .catch(() => {});
  }, []);
  return team;
}

export function ContentDetail({ id, onClose, onChanged }: { id: string | null; onClose: () => void; onChanged?: (item?: ContentItem, deleted?: boolean) => void }) {
  const { user } = useAuth();
  const team = useTeam();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: "", body: "" });
  const [comment, setComment] = useState("");
  const [review, setReview] = useState<Review | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const canWrite = user?.role !== "viewer";

  useEffect(() => {
    if (!id) return;
    setItem(null);
    setReview(null);
    setEditing(false);
    api<{ item: ContentItem; comments: Comment[]; activity: Activity[] }>(`/api/content/${id}`)
      .then((r) => {
        setItem(r.item);
        setComments(r.comments);
        setActivity(r.activity);
        setDraft({ title: r.item.title, body: r.item.body });
      })
      .catch((e) => toast.error(e.message));
  }, [id]);

  const patch = async (body: Partial<ContentItem>) => {
    if (!item) return;
    try {
      const r = await api<{ item: ContentItem }>(`/api/content/${item.id}`, { method: "PATCH", body });
      setItem(r.item);
      onChanged?.(r.item);
      return r.item;
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const saveEdit = async () => {
    const r = await patch({ title: draft.title, body: draft.body });
    if (r) {
      setEditing(false);
      toast.success("Changes saved");
    }
  };

  const addComment = async () => {
    if (!item || !comment.trim()) return;
    try {
      const r = await api<{ comment: Comment }>(`/api/content/${item.id}/comments`, { body: { body: comment } });
      setComments((c) => [...c, r.comment]);
      setComment("");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const runReview = async () => {
    if (!item) return;
    setReviewing(true);
    try {
      const r = await api<{ review: Review }>(`/api/content/${item.id}/review`, { method: "POST" });
      setReview(r.review);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setReviewing(false);
    }
  };

  const del = async () => {
    if (!item || !confirm("Delete this content item?")) return;
    try {
      await api(`/api/content/${item.id}`, { method: "DELETE" });
      onChanged?.(item, true);
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-3xl">
        {!item ? (
          <div className="space-y-4 p-6">
            <SheetTitle className="sr-only">Loading</SheetTitle>
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-96" />
          </div>
        ) : (
          <>
            <SheetHeader className="border-b p-6 pr-12">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={item.status} />
                <Badge variant="outline">{CONTENT_TYPE_LABELS[item.type] ?? item.type}</Badge>
                {item.channel && <Badge variant="secondary">{item.channel}</Badge>}
                {item.flagged && (
                  <Badge variant="destructive">
                    <Flag /> Flagged
                  </Badge>
                )}
              </div>
              {editing ? (
                <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="mt-2 text-lg font-semibold" />
              ) : (
                <SheetTitle className="mt-2 text-xl leading-snug">{item.title}</SheetTitle>
              )}
              <SheetDescription>
                By {item.author?.full_name ?? "—"} · {item.word_count.toLocaleString()} words · updated {timeAgo(item.updated_at)}
              </SheetDescription>
              {item.flag_reason && <p className="mt-2 rounded-md bg-destructive/5 p-2 text-xs text-destructive">{item.flag_reason}</p>}
            </SheetHeader>

            <div className="grid gap-4 border-b p-6 sm:grid-cols-4">
              <div className="space-y-1.5">
                <div className="text-xs text-muted-foreground">Status</div>
                <Select value={item.status} onValueChange={(v) => patch({ status: v })} disabled={!canWrite}>
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_META[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs text-muted-foreground">Assignee</div>
                <Select value={item.assignee_id ?? "none"} onValueChange={(v) => patch({ assignee_id: v === "none" ? null : v })} disabled={!canWrite}>
                  <SelectTrigger size="sm">
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
              </div>
              <div className="space-y-1.5">
                <div className="text-xs text-muted-foreground">Priority</div>
                <Select value={item.priority} onValueChange={(v) => patch({ priority: v as any })} disabled={!canWrite}>
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs text-muted-foreground">Due date</div>
                <Input type="date" className="h-8" value={item.due_date ?? ""} onChange={(e) => patch({ due_date: e.target.value || null })} disabled={!canWrite} />
              </div>
              {item.status === "scheduled" && item.scheduled_at && (
                <p className="text-xs text-muted-foreground sm:col-span-4">Scheduled to publish on {format(new Date(item.scheduled_at), "PPP p")}</p>
              )}
            </div>

            <Tabs defaultValue="content" className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <TabsList>
                  <TabsTrigger value="content">
                    <Eye /> Content
                  </TabsTrigger>
                  <TabsTrigger value="comments">
                    <MessageSquare /> Comments {comments.length > 0 && `(${comments.length})`}
                  </TabsTrigger>
                  <TabsTrigger value="review">
                    <WandSparkles /> AI review
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    <History /> History
                  </TabsTrigger>
                </TabsList>
                <div className="ml-auto flex gap-1.5">
                  <CopyButton text={item.body} />
                  <DownloadButton filename={`${item.title.slice(0, 40).replace(/[^\w]+/g, "-")}.md`} text={item.body} />
                  {canWrite &&
                    (editing ? (
                      <Button size="sm" onClick={saveEdit}>
                        <Save /> Save
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                        <Pencil /> Edit
                      </Button>
                    ))}
                </div>
              </div>

              <TabsContent value="content" className="mt-4">
                {editing ? (
                  <Textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} className="min-h-[480px] font-mono text-[13px] [field-sizing:fixed]" />
                ) : (
                  <Markdown>{item.body || "_No content yet._"}</Markdown>
                )}
              </TabsContent>

              <TabsContent value="comments" className="mt-4 space-y-4">
                {!comments.length && <p className="text-sm text-muted-foreground">No comments yet. Start the review conversation.</p>}
                <ul className="space-y-4">
                  {comments.map((c) => (
                    <li key={c.id} className="flex gap-3">
                      <UserAvatar name={c.author?.full_name} src={c.author?.avatar_url} />
                      <div className="flex-1 rounded-xl bg-muted/50 px-3 py-2">
                        <div className="text-xs">
                          <span className="font-medium">{c.author?.full_name}</span> <span className="text-muted-foreground">· {timeAgo(c.created_at)}</span>
                        </div>
                        <p className="mt-0.5 text-sm">{c.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment…" onKeyDown={(e) => e.key === "Enter" && addComment()} />
                  <Button size="icon" onClick={addComment} disabled={!comment.trim()}>
                    <Send />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="review" className="mt-4 space-y-4">
                <Button size="sm" onClick={runReview} disabled={reviewing}>
                  {reviewing ? <LoaderCircle className="animate-spin" /> : <WandSparkles />} {review ? "Review again" : "Run AI quality review"}
                </Button>
                {review && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 rounded-xl border p-4">
                      <div className="text-3xl font-semibold tracking-[-0.03em] tabular-nums">{review.score}</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium capitalize">{review.verdict.replace("_", " ")}</div>
                        <Progress value={review.score} className="mt-2" indicatorClassName={review.score >= 80 ? "bg-emerald-500" : review.score >= 60 ? "bg-amber-500" : "bg-rose-500"} />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Strengths</h4>
                        <ul className="space-y-1.5 text-sm">
                          {review.strengths.map((s, i) => (
                            <li key={i} className="flex gap-2">
                              <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" /> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Issues</h4>
                        <ul className="space-y-1.5 text-sm">
                          {review.issues.map((s, i) => (
                            <li key={i} className="flex gap-2">
                              <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" /> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Suggestions</h4>
                      <ol className="list-decimal space-y-1 pl-5 text-sm">
                        {review.suggestions.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ol>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Readability:</span> {review.readability} <br />
                      <span className="font-medium text-foreground">Brand fit:</span> {review.brand_fit}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                {!activity.length ? (
                  <p className="text-sm text-muted-foreground">No recorded history.</p>
                ) : (
                  <ol className="relative space-y-4 border-l pl-5">
                    {activity.map((a) => (
                      <li key={a.id} className="text-sm">
                        <span className="absolute -left-1 mt-1.5 size-2 rounded-full bg-primary" />
                        <span className="font-medium">{a.actor?.full_name ?? "Someone"}</span> <span className="text-muted-foreground">{describeActivity(a)}</span>
                        <div className="text-xs text-muted-foreground">{format(new Date(a.created_at), "PPp")}</div>
                      </li>
                    ))}
                  </ol>
                )}
              </TabsContent>
            </Tabs>

            {canWrite && (
              <div className={cn("sticky bottom-0 flex items-center gap-2 border-t bg-background/95 px-6 py-3 backdrop-blur")}>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={del}>
                  <Trash2 /> Delete
                </Button>
                <div className="ml-auto flex gap-2">
                  {item.status === "draft" && (
                    <Button size="sm" onClick={() => patch({ status: "review" })}>
                      <Send /> Submit for review
                    </Button>
                  )}
                  {item.status === "review" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => patch({ status: "revision" })}>
                        Request changes
                      </Button>
                      <Button size="sm" onClick={() => patch({ status: "approved" })}>
                        <CircleCheck /> Approve
                      </Button>
                    </>
                  )}
                  {item.status === "revision" && (
                    <Button size="sm" onClick={() => patch({ status: "review" })}>
                      <Send /> Resubmit
                    </Button>
                  )}
                  {item.status === "approved" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => patch({ status: "scheduled" })}>
                        Schedule
                      </Button>
                      <Button size="sm" onClick={() => patch({ status: "published" })}>
                        Publish now
                      </Button>
                    </>
                  )}
                  {item.status === "scheduled" && (
                    <Button size="sm" onClick={() => patch({ status: "published" })}>
                      Publish now
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
