"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ShieldCheck,
  Users,
  Cpu,
  Eye,
  SlidersHorizontal,
  Activity as ActivityIcon,
  UserPlus,
  Flag,
  WandSparkles,
  LoaderCircle,
  Database,
  Trash2,
  Zap,
  Coins,
  FileText,
  Star,
  Ban,
} from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { useAuth } from "@/lib/auth";
import { CONTENT_TYPE_LABELS, formatNumber } from "@/lib/utils";
import { describeActivity, timeAgo } from "@/lib/format";
import type { Activity, Overview } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EmptyState, Field, PageHeader, StatCard, StatusBadge, UserAvatar } from "@/components/shared";
import { ContentDetail } from "@/components/content-detail";

type AdminUser = { id: string; email: string; full_name: string | null; avatar_url: string | null; role: string; status: string; created_at: string; generations30d: number; tokens30d: number; lastActive: string | null; contentCount: number };
type Model = { id: string; name: string; description: string | null; tier: string | null; enabled: boolean; is_default: boolean; input_price: number; output_price: number; max_output_tokens: number; requests30d: number; tokens30d: number };
type MonItem = { id: string; title: string; type: string; status: string; flagged: boolean; flag_reason: string | null; word_count: number; created_at: string; metadata: any; author: { full_name: string | null; email: string } | null };

/* --------------------------------- Overview -------------------------------- */

function OverviewTab() {
  const { data } = useApi<Overview>("/api/analytics/overview?days=30");
  const demo = useApi<{ loaded: boolean }>("/api/admin/demo/status");
  const [busy, setBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const t = data?.totals;

  const seed = async () => {
    setBusy(true);
    try {
      const r = await api<{ counts: Record<string, number> }>("/api/admin/demo/seed", { method: "POST" });
      toast.success("Demo workspace loaded", { description: `${r.counts.content} content items, ${r.counts.prompts} prompts, ${r.counts.templates} workflows, ${r.counts.knowledge} knowledge sources, ${r.counts.usage} usage events` });
      setTimeout(() => window.location.reload(), 900);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    setBusy(true);
    try {
      await api("/api/admin/demo/seed", { method: "DELETE" });
      toast.success("Demo data removed");
      setTimeout(() => window.location.reload(), 600);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {!t ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[126px] rounded-xl" />)
        ) : (
          <>
            <StatCard label="Generations (30d)" value={formatNumber(t.generations)} change={t.generationsChange} icon={Zap} />
            <StatCard label="AI spend (30d)" value={`$${t.cost.toFixed(2)}`} icon={Coins} hint={`${formatNumber(t.tokens)} tokens`} />
            <StatCard label="Content items" value={t.contentCreated} change={t.contentChange} icon={FileText} hint="created in 30d" />
            <StatCard label="Knowledge sources" value={t.knowledgeSources} icon={Database} hint={`${t.documents} documents · ${t.prompts} prompts`} />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent platform activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {data?.activity.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <UserAvatar name={a.actor?.full_name} src={a.actor?.avatar_url} />
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium">{a.actor?.full_name ?? "Someone"}</span> <span className="text-muted-foreground">{describeActivity(a)}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(a.created_at)}</span>
                </li>
              ))}
              {data && !data.activity.length && <li className="py-6 text-center text-sm text-muted-foreground">No activity yet</li>}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-4 text-primary" /> Demo workspace
            </CardTitle>
            <CardDescription>Populate the platform with realistic sample content, prompts, workflows, a knowledge base and 30 days of usage — ideal for client presentations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demo.data?.loaded ? (
              <>
                <Badge variant="success">Demo data loaded</Badge>
                <Button variant="outline" className="w-full" onClick={() => setConfirmClear(true)} disabled={busy}>
                  <Trash2 /> Remove demo data
                </Button>
              </>
            ) : (
              <Button className="w-full" onClick={seed} disabled={busy || demo.loading}>
                {busy ? <LoaderCircle className="animate-spin" /> : <Database />} Load demo data
              </Button>
            )}
            <p className="text-xs text-muted-foreground">Only demo records are removed — your real work is never touched.</p>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove demo data?</AlertDialogTitle>
            <AlertDialogDescription>This deletes the sample content, prompts, workflows, knowledge sources and synthetic usage history.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clear}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---------------------------------- Users --------------------------------- */

function UsersTab() {
  const { user: me } = useAuth();
  const users = useApi<{ users: AdminUser[] }>("/api/admin/users");
  const [invite, setInvite] = useState({ open: false, email: "", full_name: "", role: "editor", busy: false });

  const update = async (u: AdminUser, body: Partial<AdminUser>) => {
    try {
      const r = await api<{ user: AdminUser }>(`/api/admin/users/${u.id}`, { method: "PATCH", body });
      users.setData({ users: users.data!.users.map((x) => (x.id === u.id ? { ...x, ...r.user } : x)) });
      toast.success("User updated");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const sendInvite = async () => {
    setInvite((i) => ({ ...i, busy: true }));
    try {
      await api("/api/admin/users/invite", { body: invite });
      toast.success(`Invitation sent to ${invite.email}`);
      setInvite({ open: false, email: "", full_name: "", role: "editor", busy: false });
      users.reload();
    } catch (e: any) {
      toast.error(e.message);
      setInvite((i) => ({ ...i, busy: false }));
    }
  };

  const list = users.data?.users ?? [];
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-4">
        <CardTitle>Team members</CardTitle>
        <CardDescription>
          {list.length} users · {list.filter((u) => u.role === "admin").length} admins
        </CardDescription>
        <CardAction>
          <Button size="sm" onClick={() => setInvite({ ...invite, open: true })}>
            <UserPlus /> Invite user
          </Button>
        </CardAction>
      </CardHeader>
      {users.loading ? (
        <Skeleton className="m-4 h-40" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Generations (30d)</TableHead>
              <TableHead className="text-right">Tokens (30d)</TableHead>
              <TableHead className="text-right">Content</TableHead>
              <TableHead className="text-right">Last active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <UserAvatar name={u.full_name || u.email} src={u.avatar_url} className="size-8" />
                    <div>
                      <div className="font-medium">
                        {u.full_name || "—"} {u.id === me?.id && <span className="text-xs text-muted-foreground">(you)</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select value={u.role} onValueChange={(v) => update(u, { role: v })} disabled={u.id === me?.id}>
                    <SelectTrigger size="sm" className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={u.status === "active"} onCheckedChange={(v) => update(u, { status: v ? "active" : "suspended" })} disabled={u.id === me?.id} />
                    <span className={u.status === "active" ? "text-sm" : "flex items-center gap-1 text-sm text-destructive"}>
                      {u.status === "active" ? "Active" : (
                        <>
                          <Ban className="size-3" /> Suspended
                        </>
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">{u.generations30d}</TableCell>
                <TableCell className="text-right tabular-nums">{formatNumber(u.tokens30d)}</TableCell>
                <TableCell className="text-right tabular-nums">{u.contentCount}</TableCell>
                <TableCell className="text-right text-muted-foreground">{u.lastActive ? timeAgo(u.lastActive) : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <div className="grid gap-3 border-t p-4 text-xs text-muted-foreground sm:grid-cols-3">
        <div>
          <span className="font-medium text-foreground">Admin</span> — full access, approvals, model & user management.
        </div>
        <div>
          <span className="font-medium text-foreground">Editor</span> — generate, edit and submit content for review.
        </div>
        <div>
          <span className="font-medium text-foreground">Viewer</span> — read-only access and knowledge Q&A.
        </div>
      </div>

      <Dialog open={invite.open} onOpenChange={(o) => setInvite({ ...invite, open: o })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>They&apos;ll get an email from Supabase Auth with a link to join the workspace.</DialogDescription>
          </DialogHeader>
          <Field label="Email">
            <Input type="email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} placeholder="name@company.com" />
          </Field>
          <Field label="Full name">
            <Input value={invite.full_name} onChange={(e) => setInvite({ ...invite, full_name: e.target.value })} />
          </Field>
          <Field label="Role">
            <Select value={invite.role} onValueChange={(v) => setInvite({ ...invite, role: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvite({ ...invite, open: false })}>
              Cancel
            </Button>
            <Button onClick={sendInvite} disabled={invite.busy || !invite.email}>
              {invite.busy && <LoaderCircle className="animate-spin" />} Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/* ---------------------------------- Models --------------------------------- */

function ModelsTab() {
  const models = useApi<{ models: Model[] }>("/api/admin/models");

  const update = async (m: Model, body: Partial<Model>) => {
    try {
      await api(`/api/admin/models/${encodeURIComponent(m.id)}`, { method: "PATCH", body });
      await models.reload();
      toast.success(`${m.name} updated`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (models.loading) return <Skeleton className="h-64 rounded-xl" />;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {models.data?.models.map((m) => (
        <Card key={m.id} className={m.is_default ? "border-primary/50 ring-1 ring-primary/20" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="size-4 text-primary" /> {m.name}
            </CardTitle>
            <CardDescription className="font-mono text-xs">{m.id}</CardDescription>
            <CardAction>
              <Switch checked={m.enabled} onCheckedChange={(v) => update(m, { enabled: v })} disabled={m.is_default} />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{m.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {m.tier && <Badge variant="secondary">{m.tier}</Badge>}
              {m.is_default && (
                <Badge variant="soft">
                  <Star /> Default
                </Badge>
              )}
              {!m.enabled && <Badge variant="outline">Disabled</Badge>}
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Requests (30d)</div>
                <div className="font-semibold tabular-nums">{m.requests30d.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Tokens (30d)</div>
                <div className="font-semibold tabular-nums">{formatNumber(m.tokens30d)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Input / 1M</div>
                <div className="tabular-nums">${Number(m.input_price).toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Output / 1M</div>
                <div className="tabular-nums">${Number(m.output_price).toFixed(2)}</div>
              </div>
            </div>
            <Field label="Max output tokens">
              <Select value={String(m.max_output_tokens)} onValueChange={(v) => update(m, { max_output_tokens: Number(v) })}>
                <SelectTrigger size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2048, 4096, 8192, 16000].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Button variant={m.is_default ? "secondary" : "outline"} className="w-full" disabled={m.is_default} onClick={() => update(m, { is_default: true })}>
              {m.is_default ? "Workspace default" : "Set as default"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ---------------------------- Content monitoring ---------------------------- */

function MonitoringTab() {
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const mon = useApi<{ items: MonItem[] }>(`/api/admin/content${flaggedOnly ? "?flagged=true" : ""}`, [flaggedOnly]);
  const [scanning, setScanning] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const setFlag = async (i: MonItem, flagged: boolean) => {
    try {
      const r = await api<{ item: Partial<MonItem> }>(`/api/admin/content/${i.id}/flag`, { method: "PATCH", body: { flagged } });
      mon.setData({ items: mon.data!.items.map((x) => (x.id === i.id ? { ...x, ...r.item } : x)) });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const scan = async (i: MonItem) => {
    setScanning(i.id);
    try {
      const { result } = await api<{ result: { risk: string; summary: string; flagged?: boolean; issues: any[] } }>(`/api/admin/content/${i.id}/moderate`, { method: "POST" });
      if (result.flagged) {
        mon.setData({ items: mon.data!.items.map((x) => (x.id === i.id ? { ...x, flagged: true, flag_reason: result.summary } : x)) });
        toast.warning(`Risk: ${result.risk} — flagged`, { description: result.summary });
      } else {
        toast.success(`Risk: ${result.risk} — no action needed`, { description: result.summary });
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setScanning(null);
    }
  };

  const items = mon.data?.items ?? [];
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-4">
        <CardTitle>Content monitoring</CardTitle>
        <CardDescription>Review everything generated in the workspace and run AI brand-safety checks.</CardDescription>
        <CardAction>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={flaggedOnly} onCheckedChange={setFlaggedOnly} /> Flagged only
          </label>
        </CardAction>
      </CardHeader>
      {mon.loading ? (
        <Skeleton className="m-4 h-40" />
      ) : !items.length ? (
        <EmptyState icon={Eye} title={flaggedOnly ? "Nothing flagged" : "No content yet"} className="m-4 border-0" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="max-w-[340px]">
                  <button className="block max-w-full truncate text-left font-medium hover:text-primary cursor-pointer" onClick={() => setOpenId(i.id)}>
                    {i.flagged && <Flag className="mr-1.5 inline size-3.5 text-destructive" />}
                    {i.title}
                  </button>
                  <div className="truncate text-xs text-muted-foreground">{i.flag_reason || `${CONTENT_TYPE_LABELS[i.type] ?? i.type} · ${i.word_count} words`}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">{i.author?.full_name ?? "—"}</TableCell>
                <TableCell>
                  <StatusBadge status={i.status} />
                </TableCell>
                <TableCell>{i.metadata?.generated ? <Badge variant="soft">AI</Badge> : <Badge variant="outline">Manual</Badge>}</TableCell>
                <TableCell className="text-muted-foreground">{format(new Date(i.created_at), "MMM d")}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => scan(i)} disabled={scanning === i.id}>
                      {scanning === i.id ? <LoaderCircle className="animate-spin" /> : <WandSparkles />} Scan
                    </Button>
                    <Button variant={i.flagged ? "secondary" : "ghost"} size="sm" onClick={() => setFlag(i, !i.flagged)}>
                      <Flag /> {i.flagged ? "Unflag" : "Flag"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <ContentDetail id={openId} onClose={() => setOpenId(null)} />
    </Card>
  );
}

/* ------------------------------ Workflow control ----------------------------- */

type Settings = {
  workflow: { require_approval: boolean; auto_submit_generated: boolean; approvers: string[] };
  limits: { monthly_token_budget: number; max_output_tokens: number; per_user_daily_generations: number };
  safety: { moderation_enabled: boolean; blocked_terms: string[]; flag_threshold: string };
};

function ControlTab() {
  const s = useApi<{ settings: Settings }>("/api/admin/settings");
  const [st, setSt] = useState<Settings | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  useEffect(() => {
    if (s.data) setSt(s.data.settings);
  }, [s.data]);

  const save = async (key: keyof Settings) => {
    if (!st) return;
    setSaving(key);
    try {
      await api(`/api/admin/settings/${key}`, { method: "PUT", body: { value: st[key] } });
      toast.success("Settings saved");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(null);
    }
  };

  if (!st) return <Skeleton className="h-64 rounded-xl" />;
  const wf = st.workflow;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Approval workflow</CardTitle>
          <CardDescription>Control who can publish.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>
              <span className="font-medium">Require approval</span>
              <span className="block text-xs text-muted-foreground">Only approvers can move content to Approved, Scheduled or Published</span>
            </span>
            <Switch checked={wf.require_approval} onCheckedChange={(v) => setSt({ ...st, workflow: { ...wf, require_approval: v } })} />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>
              <span className="font-medium">Auto-submit AI content</span>
              <span className="block text-xs text-muted-foreground">New generations land in Review instead of Draft</span>
            </span>
            <Switch checked={wf.auto_submit_generated} onCheckedChange={(v) => setSt({ ...st, workflow: { ...wf, auto_submit_generated: v } })} />
          </label>
          <div>
            <div className="mb-2 text-sm font-medium">Approver roles</div>
            {["admin", "editor"].map((r) => (
              <label key={r} className="flex items-center gap-2 py-1 text-sm capitalize">
                <Checkbox
                  checked={wf.approvers.includes(r)}
                  disabled={r === "admin"}
                  onCheckedChange={(v) => setSt({ ...st, workflow: { ...wf, approvers: v ? [...new Set([...wf.approvers, r])] : wf.approvers.filter((x) => x !== r) } })}
                />
                {r}s
              </label>
            ))}
          </div>
          <Button onClick={() => save("workflow")} disabled={saving === "workflow"} className="w-full">
            Save workflow settings
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Usage limits</CardTitle>
          <CardDescription>Keep AI spend predictable.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Monthly token budget">
            <Input type="number" value={st.limits.monthly_token_budget} onChange={(e) => setSt({ ...st, limits: { ...st.limits, monthly_token_budget: Number(e.target.value) } })} />
          </Field>
          <Field label="Daily generations per user">
            <Input type="number" value={st.limits.per_user_daily_generations} onChange={(e) => setSt({ ...st, limits: { ...st.limits, per_user_daily_generations: Number(e.target.value) } })} />
          </Field>
          <Field label="Max output tokens per request">
            <Input type="number" value={st.limits.max_output_tokens} onChange={(e) => setSt({ ...st, limits: { ...st.limits, max_output_tokens: Number(e.target.value) } })} />
          </Field>
          <Button onClick={() => save("limits")} disabled={saving === "limits"} className="w-full">
            Save limits
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Safety & moderation</CardTitle>
          <CardDescription>AI brand-safety scanning rules.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>
              <span className="font-medium">Auto-flag risky content</span>
              <span className="block text-xs text-muted-foreground">Scans flag items at or above the threshold</span>
            </span>
            <Switch checked={st.safety.moderation_enabled} onCheckedChange={(v) => setSt({ ...st, safety: { ...st.safety, moderation_enabled: v } })} />
          </label>
          <Field label="Flag threshold">
            <Select value={st.safety.flag_threshold} onValueChange={(v) => setSt({ ...st, safety: { ...st.safety, flag_threshold: v } })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medium">Medium risk and above</SelectItem>
                <SelectItem value="high">High risk only</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Blocked terms" hint="comma separated">
            <Input
              value={st.safety.blocked_terms.join(", ")}
              onChange={(e) => setSt({ ...st, safety: { ...st.safety, blocked_terms: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) } })}
              placeholder="guaranteed results, #1 in the world"
            />
          </Field>
          <Button onClick={() => save("safety")} disabled={saving === "safety"} className="w-full">
            Save safety settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* --------------------------------- Audit log -------------------------------- */

function AuditTab() {
  const log = useApi<{ activity: Activity[] }>("/api/admin/activity?limit=200");
  if (log.loading) return <Skeleton className="h-64 rounded-xl" />;
  return (
    <Card className="py-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Entity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {log.data?.activity.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="text-muted-foreground">{format(new Date(a.created_at), "MMM d, HH:mm")}</TableCell>
              <TableCell>{a.actor?.full_name ?? "—"}</TableCell>
              <TableCell className="max-w-[420px] truncate">{describeActivity(a)}</TableCell>
              <TableCell>
                <Badge variant="outline">{a.entity}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  if (user?.role !== "admin") {
    return <EmptyState icon={ShieldCheck} title="Admins only" description="You need the admin role to open the admin dashboard. Ask a workspace admin for access." className="mt-10" />;
  }
  return (
    <div>
      <PageHeader icon={ShieldCheck} title="Admin Dashboard" description="Centralized control of AI models, users, content monitoring, usage and workflow governance." />
      <Tabs defaultValue="overview">
        <TabsList className="mb-2">
          <TabsTrigger value="overview">
            <ActivityIcon /> Overview
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users /> Users
          </TabsTrigger>
          <TabsTrigger value="models">
            <Cpu /> AI models
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <Eye /> Content monitoring
          </TabsTrigger>
          <TabsTrigger value="control">
            <SlidersHorizontal /> Workflow control
          </TabsTrigger>
          <TabsTrigger value="audit">
            <FileText /> Audit log
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="models">
          <ModelsTab />
        </TabsContent>
        <TabsContent value="monitoring">
          <MonitoringTab />
        </TabsContent>
        <TabsContent value="control">
          <ControlTab />
        </TabsContent>
        <TabsContent value="audit">
          <AuditTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
