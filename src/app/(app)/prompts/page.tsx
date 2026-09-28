"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Braces,
  Plus,
  Search,
  Star,
  Play,
  Pencil,
  Trash2,
  Users,
  Lock,
  Workflow,
  WandSparkles,
  FlaskConical,
  LoaderCircle,
  ArrowRight,
  Square,
  CircleCheck,
  Save,
  X,
} from "lucide-react";
import { api, useStream, streamApi } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { Prompt, WorkflowTemplate } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CopyButton, EmptyState, Field, GeneratingDots, Markdown, ModelSelect, PageHeader } from "@/components/shared";

const CATEGORIES = ["General", "SEO", "Sales", "Social", "Email", "Operations", "Editing", "Support", "Research"];
const findVars = (t: string) => [...new Set([...t.matchAll(/\{\{\s*([\w.-]+)\s*\}\}/g)].map((m) => m[1]))];

/* ------------------------------ Prompt editor ------------------------------ */

type Draft = { id?: string; title: string; description: string; category: string; template: string; is_shared: boolean };
const emptyDraft: Draft = { title: "", description: "", category: "General", template: "", is_shared: true };

function PromptEditor({ draft, onClose, onSaved }: { draft: Draft | null; onClose: () => void; onSaved: () => void }) {
  const [d, setD] = useState<Draft>(draft ?? emptyDraft);
  const [busy, setBusy] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const vars = findVars(d.template);

  const optimize = async () => {
    if (!d.template.trim()) return;
    setOptimizing(true);
    try {
      const r = await api<{ optimized: string; changes: string[] }>("/api/prompts/optimize", { body: { template: d.template, goal: d.description } });
      setD({ ...d, template: r.optimized });
      toast.success("Prompt optimized", { description: r.changes.slice(0, 2).join(" · ") });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setOptimizing(false);
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      if (d.id) await api(`/api/prompts/${d.id}`, { method: "PATCH", body: d });
      else await api("/api/prompts", { body: d });
      toast.success("Prompt saved");
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={!!draft} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{d.id ? "Edit prompt" : "New prompt"}</DialogTitle>
          <DialogDescription>Use {"{{variable}}"} placeholders — teammates fill them in when they run the prompt.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
          <Field label="Title">
            <Input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} placeholder="SEO blog outline" />
          </Field>
          <Field label="Category">
            <select value={d.category} onChange={(e) => setD({ ...d, category: e.target.value })} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm dark:bg-input/30">
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Description">
          <Input value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} placeholder="What this prompt is for" />
        </Field>
        <Field label="Prompt template">
          <Textarea value={d.template} onChange={(e) => setD({ ...d, template: e.target.value })} className="min-h-44 font-mono text-[13px] [field-sizing:fixed]" placeholder="Write a {{format}} about {{topic}} for {{audience}}…" />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Variables:</span>
          {vars.length ? vars.map((v) => <Badge key={v} variant="soft" className="font-mono">{`{{${v}}}`}</Badge>) : <span className="text-xs text-muted-foreground">none detected</span>}
          <Button variant="outline" size="sm" className="ml-auto" onClick={optimize} disabled={optimizing || !d.template.trim()}>
            {optimizing ? <LoaderCircle className="animate-spin" /> : <WandSparkles />} Optimize with AI
          </Button>
        </div>
        <label className="flex items-center justify-between rounded-lg border p-3 text-sm">
          <span>
            <span className="font-medium">Share with team</span>
            <span className="block text-xs text-muted-foreground">Visible to everyone in the workspace</span>
          </span>
          <Switch checked={d.is_shared} onCheckedChange={(v) => setD({ ...d, is_shared: v })} />
        </label>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={busy || !d.title.trim() || !d.template.trim()}>
            Save prompt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------- Prompt runner ------------------------------ */

function PromptRunner({ prompt, onClose }: { prompt: Prompt | null; onClose: () => void }) {
  const [vars, setVars] = useState<Record<string, string>>({});
  const [model, setModel] = useState("");
  const [brand, setBrand] = useState(true);
  const s = useStream();
  const preview = useMemo(() => prompt?.template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, k) => vars[k] || `{{${k}}}`) ?? "", [prompt, vars]);

  return (
    <Sheet
      open={!!prompt}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          s.reset();
          setVars({});
        }
      }}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        {prompt && (
          <>
            <SheetHeader>
              <SheetTitle>{prompt.title}</SheetTitle>
              <SheetDescription>{prompt.description}</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 px-4 pb-6">
              {prompt.variables.map((v) => (
                <Field key={v} label={v.replace(/_/g, " ")}>
                  {/notes|text|ticket|content/.test(v) ? (
                    <Textarea value={vars[v] || ""} onChange={(e) => setVars({ ...vars, [v]: e.target.value })} className="min-h-24" />
                  ) : (
                    <Input value={vars[v] || ""} onChange={(e) => setVars({ ...vars, [v]: e.target.value })} />
                  )}
                </Field>
              ))}
              <details className="rounded-lg border bg-muted/30 p-3 text-sm">
                <summary className="cursor-pointer font-medium">Preview filled prompt</summary>
                <pre className="mt-2 font-mono text-xs whitespace-pre-wrap text-muted-foreground">{preview}</pre>
              </details>
              <div className="flex items-center gap-3">
                <ModelSelect value={model} onChange={setModel} className="w-48" />
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Switch checked={brand} onCheckedChange={setBrand} /> Brand voice
                </label>
                {s.streaming ? (
                  <Button className="ml-auto" variant="outline" onClick={s.stop}>
                    <Square /> Stop
                  </Button>
                ) : (
                  <Button className="ml-auto" onClick={() => s.start(`/api/prompts/${prompt.id}/run`, { variables: vars, model, useBrandVoice: brand })}>
                    <Play /> Run prompt
                  </Button>
                )}
              </div>
              {(s.text || s.streaming || s.error) && (
                <Card className="gap-2 py-4">
                  <CardContent>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">Output</span>
                      <CopyButton text={s.text} />
                    </div>
                    {s.error && <p className="text-sm text-destructive">{s.error}</p>}
                    {s.streaming && !s.text && <GeneratingDots />}
                    <Markdown streaming={s.streaming}>{s.text}</Markdown>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------ Workflow editor ----------------------------- */

function WorkflowEditor({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState([{ name: "Step 1", instruction: "" }]);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await api("/api/templates", { body: { name, description, steps } });
      toast.success("Workflow template saved");
      onSaved();
      onClose();
      setName("");
      setDescription("");
      setSteps([{ name: "Step 1", instruction: "" }]);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New workflow template</DialogTitle>
          <DialogDescription>Chain prompts: each step receives the original input and the previous step&apos;s output.</DialogDescription>
        </DialogHeader>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Workflow name" />
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
        <div className="space-y-3">
          {steps.map((st, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{i + 1}</span>
                {i < steps.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Input value={st.name} onChange={(e) => setSteps(steps.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} className="h-8" />
                  {steps.length > 1 && (
                    <Button variant="ghost" size="icon-sm" onClick={() => setSteps(steps.filter((_, k) => k !== i))}>
                      <X />
                    </Button>
                  )}
                </div>
                <Textarea value={st.instruction} onChange={(e) => setSteps(steps.map((x, k) => (k === i ? { ...x, instruction: e.target.value } : x)))} placeholder="Instruction for this step" className="min-h-16" />
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="w-fit" onClick={() => setSteps([...steps, { name: `Step ${steps.length + 1}`, instruction: "" }])} disabled={steps.length >= 8}>
          <Plus /> Add step
        </Button>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={busy || !name.trim() || !steps.some((s) => s.instruction.trim())}>
            Save workflow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ Workflow runner ----------------------------- */

function WorkflowRunner({ template, onClose }: { template: WorkflowTemplate | null; onClose: () => void }) {
  const [input, setInput] = useState("");
  const [save, setSave] = useState(true);
  const [running, setRunning] = useState(false);
  const [outputs, setOutputs] = useState<string[]>([]);
  const [active, setActive] = useState(-1);
  const [contentId, setContentId] = useState<string | null>(null);

  const run = async () => {
    if (!template || !input.trim()) return;
    setRunning(true);
    setOutputs(template.steps.map(() => ""));
    setContentId(null);
    try {
      await streamApi(`/api/templates/${template.id}/run`, { input, saveToLibrary: save }, (e) => {
        if (e.type === "step_start") setActive(e.index);
        if (e.type === "text") setOutputs((o) => o.map((x, i) => (i === e.index ? x + e.text : x)));
        if (e.type === "done") {
          setActive(template.steps.length);
          setContentId(e.contentId);
        }
      });
      toast.success(save ? "Workflow complete — final output saved to the library" : "Workflow complete");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <Sheet
      open={!!template}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          setOutputs([]);
          setActive(-1);
        }
      }}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        {template && (
          <>
            <SheetHeader>
              <SheetTitle>{template.name}</SheetTitle>
              <SheetDescription>{template.description}</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 px-4 pb-6">
              <Field label="Input">
                <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-28" placeholder="Topic, brief or source content…" />
              </Field>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Switch checked={save} onCheckedChange={setSave} /> Save final output to library
                </label>
                <Button onClick={run} disabled={running || !input.trim()}>
                  {running ? <LoaderCircle className="animate-spin" /> : <Play />} Run workflow
                </Button>
              </div>
              <ol className="space-y-3">
                {template.steps.map((st, i) => (
                  <li key={i} className={cn("rounded-xl border p-4 transition-colors", active === i && "border-primary/50 bg-primary/5")}>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {active > i ? (
                        <CircleCheck className="size-4 text-emerald-600" />
                      ) : active === i ? (
                        <LoaderCircle className="size-4 animate-spin text-primary" />
                      ) : (
                        <span className="grid size-4 place-items-center rounded-full border text-[10px]">{i + 1}</span>
                      )}
                      {st.name}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{st.instruction}</p>
                    {outputs[i] && (
                      <div className="mt-3 max-h-80 overflow-y-auto rounded-lg bg-background p-3">
                        <Markdown streaming={active === i}>{outputs[i]}</Markdown>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
              {contentId && (
                <Button asChild variant="outline" className="w-full">
                  <a href={`/library?open=${contentId}`}>Open final output in library</a>
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ---------------------------------- Page ---------------------------------- */

export default function PromptsPage() {
  const { user } = useAuth();
  const canWrite = user?.role !== "viewer";
  const prompts = useApi<{ prompts: Prompt[] }>("/api/prompts");
  const templates = useApi<{ templates: WorkflowTemplate[] }>("/api/templates");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [editing, setEditing] = useState<Draft | null>(null);
  const [running, setRunning] = useState<Prompt | null>(null);
  const [wfOpen, setWfOpen] = useState(false);
  const [wfRun, setWfRun] = useState<WorkflowTemplate | null>(null);

  // Playground
  const [pgSystem, setPgSystem] = useState("");
  const [pgPrompt, setPgPrompt] = useState("");
  const [pgModel, setPgModel] = useState("");
  const pg = useStream();

  // Optimizer
  const [opt, setOpt] = useState({ input: "", goal: "", busy: false, result: null as null | { optimized: string; changes: string[]; score_before: number; score_after: number } });

  const list = prompts.data?.prompts ?? [];
  const cats = ["All", ...Array.from(new Set(list.map((p) => p.category)))];
  const filtered = list
    .filter((p) => cat === "All" || p.category === cat)
    .filter((p) => !q || `${p.title} ${p.description} ${p.template}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite));

  const toggleFav = async (p: Prompt) => {
    prompts.setData({ prompts: list.map((x) => (x.id === p.id ? { ...x, is_favorite: !x.is_favorite } : x)) });
    await api(`/api/prompts/${p.id}`, { method: "PATCH", body: { is_favorite: !p.is_favorite } }).catch(() => {});
  };

  const del = async (p: Prompt) => {
    if (!confirm(`Delete “${p.title}”?`)) return;
    try {
      await api(`/api/prompts/${p.id}`, { method: "DELETE" });
      prompts.reload();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const optimize = async () => {
    setOpt((o) => ({ ...o, busy: true }));
    try {
      const result = await api("/api/prompts/optimize", { body: { template: opt.input, goal: opt.goal } });
      setOpt((o) => ({ ...o, busy: false, result }));
    } catch (e: any) {
      toast.error(e.message);
      setOpt((o) => ({ ...o, busy: false }));
    }
  };

  return (
    <div>
      <PageHeader
        icon={Braces}
        title="Custom Prompt Workspace"
        description="Build a shared library of prompts and multi-step workflows so the whole team gets consistent, high-quality output."
        actions={
          canWrite && (
            <>
              <Button variant="outline" onClick={() => setWfOpen(true)}>
                <Workflow /> New workflow
              </Button>
              <Button onClick={() => setEditing({ ...emptyDraft })}>
                <Plus /> New prompt
              </Button>
            </>
          )
        }
      />

      <Tabs defaultValue="library">
        <TabsList>
          <TabsTrigger value="library">
            <Braces /> Prompt library
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <Workflow /> Workflow templates
          </TabsTrigger>
          <TabsTrigger value="playground">
            <FlaskConical /> Playground
          </TabsTrigger>
          <TabsTrigger value="optimizer">
            <WandSparkles /> Optimizer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="mt-3 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full max-w-xs">
              <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search prompts" className="pl-9" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={cn("rounded-full border px-3 py-1 text-xs transition-colors cursor-pointer", cat === c ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          {prompts.loading ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-xl" />
              ))}
            </div>
          ) : !filtered.length ? (
            <EmptyState icon={Braces} title="No prompts yet" description="Save your best prompts with variables so the team can reuse them." action={canWrite && <Button onClick={() => setEditing({ ...emptyDraft })}>Create a prompt</Button>} />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <Card key={p.id} className="group gap-3 p-5 transition-shadow hover:shadow-md">
                  <div className="flex items-start gap-2">
                    <Badge variant="soft">{p.category}</Badge>
                    {p.is_shared ? (
                      <Badge variant="outline">
                        <Users /> Team
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Lock /> Private
                      </Badge>
                    )}
                    <button onClick={() => toggleFav(p)} className="ml-auto text-muted-foreground hover:text-amber-500 cursor-pointer" aria-label="Favorite">
                      <Star className={cn("size-4", p.is_favorite && "fill-amber-400 text-amber-400")} />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description || p.template}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.variables.slice(0, 4).map((v) => (
                      <code key={v} className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
                        {v}
                      </code>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center gap-2 pt-1">
                    <span className="text-xs text-muted-foreground">
                      {p.uses} runs · {p.author?.full_name ?? "—"}
                    </span>
                    <div className="ml-auto flex gap-1">
                      {canWrite && (
                        <>
                          <Button variant="ghost" size="icon-sm" onClick={() => setEditing({ id: p.id, title: p.title, description: p.description ?? "", category: p.category, template: p.template, is_shared: p.is_shared })}>
                            <Pencil />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => del(p)}>
                            <Trash2 />
                          </Button>
                        </>
                      )}
                      <Button size="sm" onClick={() => setRunning(p)} disabled={!canWrite}>
                        <Play /> Run
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="workflows" className="mt-3">
          {templates.loading ? (
            <Skeleton className="h-48 rounded-xl" />
          ) : !templates.data?.templates.length ? (
            <EmptyState icon={Workflow} title="No workflow templates" description="Chain multiple AI steps — outline, draft, polish — into one repeatable run." action={canWrite && <Button onClick={() => setWfOpen(true)}>Create workflow</Button>} />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {templates.data.templates.map((t) => (
                <Card key={t.id} className="gap-4 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{t.name}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>
                    </div>
                    <Badge variant="secondary">{t.runs} runs</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {t.steps.map((s, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        <span className="rounded-md border bg-muted/40 px-2 py-1 text-xs font-medium">{s.name}</span>
                        {i < t.steps.length - 1 && <ArrowRight className="size-3 text-muted-foreground" />}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{t.steps.length} steps · by {t.author?.full_name ?? "—"}</span>
                    <div className="flex gap-1">
                      {canWrite && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={async () => {
                            if (!confirm(`Delete “${t.name}”?`)) return;
                            await api(`/api/templates/${t.id}`, { method: "DELETE" });
                            templates.reload();
                          }}
                        >
                          <Trash2 />
                        </Button>
                      )}
                      <Button size="sm" onClick={() => setWfRun(t)} disabled={!canWrite}>
                        <Play /> Run
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="playground" className="mt-3">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Prompt</CardTitle>
                <CardDescription>Experiment freely, then save what works to the library.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="System prompt" hint="optional">
                  <Textarea value={pgSystem} onChange={(e) => setPgSystem(e.target.value)} className="min-h-20" placeholder="You are a senior copywriter…" />
                </Field>
                <Field label="User prompt">
                  <Textarea value={pgPrompt} onChange={(e) => setPgPrompt(e.target.value)} className="min-h-44 [field-sizing:fixed]" placeholder="Write 3 taglines for…" />
                </Field>
                <div className="flex items-center gap-2">
                  <ModelSelect value={pgModel} onChange={setPgModel} className="w-52" />
                  {canWrite && (
                    <Button variant="outline" onClick={() => setEditing({ ...emptyDraft, template: pgPrompt })} disabled={!pgPrompt.trim()}>
                      <Save /> Save
                    </Button>
                  )}
                  {pg.streaming ? (
                    <Button className="ml-auto" variant="outline" onClick={pg.stop}>
                      <Square /> Stop
                    </Button>
                  ) : (
                    <Button className="ml-auto" onClick={() => pg.start("/api/prompts/playground", { prompt: pgPrompt, system: pgSystem, model: pgModel })} disabled={!pgPrompt.trim() || !canWrite}>
                      <Play /> Run
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Response <CopyButton text={pg.text} />
                </CardTitle>
                {pg.done?.usage && (
                  <CardDescription>
                    {pg.done.model} · {pg.done.usage.input_tokens} in / {pg.done.usage.output_tokens} out tokens
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="max-h-[520px] overflow-y-auto">
                {pg.error && <p className="text-sm text-destructive">{pg.error}</p>}
                {pg.streaming && !pg.text && <GeneratingDots />}
                {pg.text ? <Markdown streaming={pg.streaming}>{pg.text}</Markdown> : !pg.streaming && <p className="text-sm text-muted-foreground">Run a prompt to see the response.</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimizer" className="mt-3">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Prompt optimization</CardTitle>
                <CardDescription>Claude rewrites your prompt with a clear role, context, constraints and output format.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Your prompt">
                  <Textarea value={opt.input} onChange={(e) => setOpt({ ...opt, input: e.target.value })} className="min-h-44 font-mono text-[13px] [field-sizing:fixed]" placeholder="write a linkedin post about our product launch" />
                </Field>
                <Field label="Goal" hint="optional">
                  <Input value={opt.goal} onChange={(e) => setOpt({ ...opt, goal: e.target.value })} placeholder="Consistent, on-brand launch posts for B2B buyers" />
                </Field>
                <Button onClick={optimize} disabled={opt.busy || !opt.input.trim() || !canWrite}>
                  {opt.busy ? <LoaderCircle className="animate-spin" /> : <WandSparkles />} Optimize prompt
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Optimized prompt</CardTitle>
                {opt.result && (
                  <CardDescription>
                    Quality score <span className="font-medium text-foreground">{opt.result.score_before}/10</span> → <span className="font-semibold text-primary">{opt.result.score_after}/10</span>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {opt.busy && <GeneratingDots label="Engineering a better prompt" />}
                {!opt.busy && !opt.result && <p className="text-sm text-muted-foreground">The improved prompt and a list of changes will appear here.</p>}
                {opt.result && (
                  <>
                    <pre className="max-h-72 overflow-y-auto rounded-lg bg-muted/50 p-3 font-mono text-xs whitespace-pre-wrap">{opt.result.optimized}</pre>
                    <ul className="space-y-1.5 text-sm">
                      {opt.result.changes.map((c, i) => (
                        <li key={i} className="flex gap-2">
                          <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                          {c}
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <CopyButton text={opt.result.optimized} label="Copy" />
                      {canWrite && (
                        <Button size="sm" onClick={() => setEditing({ ...emptyDraft, template: opt.result!.optimized, description: opt.goal })}>
                          <Save /> Save to library
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {editing && <PromptEditor key={editing.id ?? "new" + editing.template.length} draft={editing} onClose={() => setEditing(null)} onSaved={prompts.reload} />}
      <PromptRunner prompt={running} onClose={() => setRunning(null)} />
      <WorkflowEditor open={wfOpen} onClose={() => setWfOpen(false)} onSaved={templates.reload} />
      <WorkflowRunner template={wfRun} onClose={() => setWfRun(null)} />
    </div>
  );
}
