"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  FileSearch,
  Upload,
  FileText,
  Trash2,
  BookOpen,
  ListChecks,
  Braces,
  Tags,
  FileBarChart,
  MessageSquare,
  Send,
  LoaderCircle,
  ClipboardPaste,
  Check,
  Square,
} from "lucide-react";
import { api, useStream } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CopyButton, DownloadButton, EmptyState, GeneratingDots, Markdown, PageHeader } from "@/components/shared";

type DocSummary = { id: string; name: string; mime_type: string; size_bytes: number; word_count: number; summary: string | null; in_knowledge_base: boolean; created_at: string; classification: any };
type Doc = DocSummary & { text_content: string; extracted: any; classification: any };

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

function StreamPane({ path, body, stored, label, idleText, onDone }: { path: string; body: any; stored?: string | null; label: string; idleText: string; onDone?: (t: string) => void }) {
  const s = useStream();
  const text = s.text || (!s.streaming ? stored || "" : "");
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {s.streaming ? (
          <Button size="sm" variant="outline" onClick={s.stop}>
            <Square /> Stop
          </Button>
        ) : (
          <Button size="sm" onClick={() => s.start(path, body, (e) => e.type === "done" && onDone?.(""))}>
            {text ? "Regenerate" : label}
          </Button>
        )}
        <div className="ml-auto flex gap-2">
          <CopyButton text={text} />
          <DownloadButton filename={`${label.toLowerCase().replace(/\s+/g, "-")}.md`} text={text} />
        </div>
      </div>
      {s.error && <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{s.error}</div>}
      {s.streaming && !s.text && <GeneratingDots label="Reading the document…" />}
      {text ? <Markdown streaming={s.streaming}>{text}</Markdown> : !s.streaming && <p className="text-sm text-muted-foreground">{idleText}</p>}
    </div>
  );
}

function JsonPane({ docId, action, stored, render }: { docId: string; action: "extract" | "classify"; stored: any; render: (d: any) => React.ReactNode }) {
  const [data, setData] = useState<any>(stored);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setData(stored);
  }, [stored, docId]);
  const run = async () => {
    setBusy(true);
    try {
      const { result } = await api(`/api/documents/${docId}/analyze`, { body: { action } });
      setData(result);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={run} disabled={busy}>
          {busy && <LoaderCircle className="animate-spin" />}
          {data ? "Run again" : action === "extract" ? "Extract information" : "Classify document"}
        </Button>
        {data && (
          <div className="ml-auto">
            <CopyButton text={JSON.stringify(data, null, 2)} label="Copy JSON" />
          </div>
        )}
      </div>
      {busy && <GeneratingDots label="Analyzing…" />}
      {!busy && data && render(data)}
      {!busy && !data && <p className="text-sm text-muted-foreground">Run the analysis to get structured, exportable data.</p>}
    </div>
  );
}

function List({ title, items }: { title: string; items?: any[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</h4>
      <ul className="space-y-1.5 text-sm">
        {items.map((i, k) => (
          <li key={k} className="flex gap-2">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
            <span>{typeof i === "string" ? i : Object.values(i).filter(Boolean).join(" — ")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AskPane({ docId }: { docId: string }) {
  const [q, setQ] = useState("");
  const [thread, setThread] = useState<{ q: string; a: string }[]>([]);
  const s = useStream();
  useEffect(() => {
    setThread([]);
  }, [docId]);
  const ask = async (question = q) => {
    if (!question.trim()) return;
    setQ("");
    let acc = "";
    setThread((t) => [...t, { q: question, a: "" }]);
    await s.start(`/api/documents/${docId}/analyze`, { action: "ask", question }, (e) => {
      if (e.type === "text") {
        acc += e.text;
        setThread((t) => t.map((m, i) => (i === t.length - 1 ? { ...m, a: acc } : m)));
      }
    });
  };
  return (
    <div className="flex flex-col gap-4">
      {!thread.length && (
        <div className="flex flex-wrap gap-2">
          {["What are the key takeaways?", "What deadlines or dates are mentioned?", "Who are the main stakeholders?", "What risks does this document raise?"].map((x) => (
            <button key={x} onClick={() => ask(x)} className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground cursor-pointer">
              {x}
            </button>
          ))}
        </div>
      )}
      <div className="space-y-5">
        {thread.map((m, i) => (
          <div key={i} className="space-y-2">
            <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground">{m.q}</div>
            <div className="max-w-[92%] rounded-2xl rounded-bl-sm border bg-muted/30 px-4 py-3">
              {m.a ? <Markdown streaming={s.streaming && i === thread.length - 1}>{m.a}</Markdown> : <GeneratingDots label="Searching the document" />}
            </div>
          </div>
        ))}
        {s.error && <div className="text-sm text-destructive">{s.error}</div>}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
        className="flex gap-2"
      >
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask anything about this document…" disabled={s.streaming} />
        <Button type="submit" size="icon" disabled={s.streaming || !q.trim()}>
          <Send />
        </Button>
      </form>
    </div>
  );
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const list = useApi<{ documents: DocSummary[] }>("/api/documents");
  const [selected, setSelected] = useState<string | null>(null);
  const [doc, setDoc] = useState<Doc | null>(null);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [paste, setPaste] = useState({ open: false, name: "", text: "" });
  const [kbBusy, setKbBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const canWrite = user?.role !== "viewer";

  useEffect(() => {
    if (!selected && list.data?.documents.length) setSelected(list.data.documents[0].id);
  }, [list.data, selected]);

  useEffect(() => {
    if (!selected) {
      setDoc(null);
      return;
    }
    setDoc(null);
    api<{ document: Doc }>(`/api/documents/${selected}`)
      .then((r) => setDoc(r.document))
      .catch((e) => toast.error(e.message));
  }, [selected]);

  const upload = async (file: File) => {
    if (file.size > 4 * 1024 * 1024) return toast.error("Max file size is 4 MB");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { document } = await api<{ document: DocSummary }>("/api/documents", { formData: fd });
      toast.success(`${document.name} uploaded`);
      await list.reload();
      setSelected(document.id);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const savePaste = async () => {
    try {
      const { document } = await api<{ document: DocSummary }>("/api/documents", { body: { name: paste.name || "Pasted text", text: paste.text } });
      setPaste({ open: false, name: "", text: "" });
      await list.reload();
      setSelected(document.id);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const addToKb = async () => {
    if (!doc) return;
    setKbBusy(true);
    try {
      await api(`/api/documents/${doc.id}/knowledge`, { method: "POST" });
      setDoc({ ...doc, in_knowledge_base: true });
      list.reload();
      toast.success("Added to the knowledge base — it's now searchable in RAG answers.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setKbBusy(false);
    }
  };

  const remove = async () => {
    if (!doc || !confirm(`Delete ${doc.name}?`)) return;
    await api(`/api/documents/${doc.id}`, { method: "DELETE" });
    setSelected(null);
    list.reload();
  };

  return (
    <div>
      <PageHeader
        icon={FileSearch}
        title="Document Intelligence"
        description="Upload reports, contracts and briefs. Summarize, extract structured data, classify, generate reports and ask questions."
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          {canWrite && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                const f = e.dataTransfer.files?.[0];
                if (f) upload(f);
              }}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors",
                drag ? "border-primary bg-primary/5" : "hover:border-primary/40 hover:bg-muted/40"
              )}
            >
              {uploading ? <LoaderCircle className="size-6 animate-spin text-primary" /> : <Upload className="size-6 text-primary" />}
              <div className="mt-2 text-sm font-medium">{uploading ? "Extracting text…" : "Drop a file or click to upload"}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">PDF, DOCX, TXT, MD, CSV · up to 4 MB</div>
              <input
                ref={fileRef}
                type="file"
                hidden
                accept=".pdf,.docx,.txt,.md,.csv,.json,.html"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                  e.target.value = "";
                }}
              />
            </div>
          )}
          {canWrite && (
            <Button variant="outline" size="sm" className="w-full" onClick={() => setPaste({ ...paste, open: true })}>
              <ClipboardPaste /> Paste text instead
            </Button>
          )}

          <Card className="gap-0 py-0">
            <div className="border-b px-4 py-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Documents ({list.data?.documents.length ?? 0})
            </div>
            {list.loading ? (
              <div className="space-y-2 p-3">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : !list.data?.documents.length ? (
              <p className="p-4 text-sm text-muted-foreground">No documents yet.</p>
            ) : (
              <ul className="max-h-[520px] divide-y overflow-y-auto">
                {list.data.documents.map((d) => (
                  <li key={d.id}>
                    <button
                      onClick={() => setSelected(d.id)}
                      className={cn("flex w-full items-start gap-3 px-4 py-3 text-left transition-colors cursor-pointer", selected === d.id ? "bg-accent" : "hover:bg-muted/50")}
                    >
                      <FileText className={cn("mt-0.5 size-4 shrink-0", selected === d.id ? "text-primary" : "text-muted-foreground")} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{d.name}</div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          {d.word_count.toLocaleString()} words · {timeAgo(d.created_at)}
                        </div>
                      </div>
                      {d.in_knowledge_base && <BookOpen className="size-3.5 shrink-0 text-primary" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {!selected ? (
          <EmptyState icon={FileSearch} title="Upload a document to begin" description="Try a report, proposal, contract or meeting transcript." className="min-h-[500px]" />
        ) : !doc ? (
          <Skeleton className="h-[600px] rounded-xl" />
        ) : (
          <Card className="gap-0 py-0">
            <div className="flex flex-wrap items-center gap-3 border-b px-5 py-4">
              <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{doc.name}</div>
                <div className="text-xs text-muted-foreground">
                  {doc.word_count.toLocaleString()} words · {kb(doc.size_bytes)} · ~{Math.max(1, Math.round(doc.word_count / 230))} min read
                </div>
              </div>
              {doc.classification?.category && <Badge variant="soft">{doc.classification.category}</Badge>}
              {canWrite &&
                (doc.in_knowledge_base ? (
                  <Badge variant="success">
                    <Check /> In knowledge base
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm" onClick={addToKb} disabled={kbBusy}>
                    {kbBusy ? <LoaderCircle className="animate-spin" /> : <BookOpen />} Add to knowledge base
                  </Button>
                ))}
              {canWrite && (
                <Button variant="ghost" size="icon-sm" onClick={remove} aria-label="Delete">
                  <Trash2 />
                </Button>
              )}
            </div>

            <Tabs defaultValue="summary" className="p-5" key={doc.id}>
              <TabsList className="mb-4">
                <TabsTrigger value="summary">
                  <ListChecks /> Summary
                </TabsTrigger>
                <TabsTrigger value="extract">
                  <Braces /> Extract
                </TabsTrigger>
                <TabsTrigger value="classify">
                  <Tags /> Classify
                </TabsTrigger>
                <TabsTrigger value="report">
                  <FileBarChart /> Report
                </TabsTrigger>
                <TabsTrigger value="ask">
                  <MessageSquare /> Ask
                </TabsTrigger>
                <TabsTrigger value="text">
                  <FileText /> Text
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <StreamPane path={`/api/documents/${doc.id}/analyze`} body={{ action: "summarize" }} stored={doc.summary} label="Summarize" idleText="Generate an executive summary with key points and open questions." />
              </TabsContent>
              <TabsContent value="extract">
                <JsonPane
                  docId={doc.id}
                  action="extract"
                  stored={doc.extracted}
                  render={(d) => (
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-5">
                        {d.document_type && (
                          <div>
                            <div className="text-xs text-muted-foreground">Document type</div>
                            <div className="font-medium">{d.document_type}</div>
                          </div>
                        )}
                        <List title="Key facts" items={d.key_facts} />
                        <List title="Action items" items={d.action_items} />
                      </div>
                      <div className="space-y-5">
                        <List title="People" items={d.people} />
                        <List title="Organizations" items={d.organizations} />
                        <List title="Dates" items={d.dates} />
                        <List title="Amounts" items={d.amounts} />
                        {d.keywords?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {d.keywords.map((k: string) => (
                              <Badge key={k} variant="outline">
                                {k}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                />
              </TabsContent>
              <TabsContent value="classify">
                <JsonPane
                  docId={doc.id}
                  action="classify"
                  stored={doc.classification}
                  render={(d) => (
                    <div className="space-y-5">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                          ["Category", d.category],
                          ["Sentiment", d.sentiment],
                          ["Confidentiality", d.confidentiality],
                          ["Audience", d.audience],
                          ["Language", d.language],
                          ["Reading level", d.reading_level],
                        ]
                          .filter(([, v]) => v)
                          .map(([k, v]) => (
                            <div key={k} className="rounded-lg border p-3">
                              <div className="text-xs text-muted-foreground">{k}</div>
                              <div className="mt-0.5 text-sm font-medium capitalize">{v}</div>
                            </div>
                          ))}
                      </div>
                      {typeof d.confidence === "number" && (
                        <div className="max-w-sm">
                          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                            <span>Confidence</span>
                            <span>{Math.round(d.confidence * 100)}%</span>
                          </div>
                          <Progress value={d.confidence * 100} />
                        </div>
                      )}
                      <List title="Topics" items={d.topics} />
                      <List title="Subcategories" items={d.subcategories} />
                      {d.rationale && <p className="text-sm text-muted-foreground">{d.rationale}</p>}
                    </div>
                  )}
                />
              </TabsContent>
              <TabsContent value="report">
                <StreamPane path={`/api/documents/${doc.id}/analyze`} body={{ action: "report" }} label="Generate report" idleText="Turn this document into a structured professional report with findings and recommendations." />
              </TabsContent>
              <TabsContent value="ask">
                <AskPane docId={doc.id} />
              </TabsContent>
              <TabsContent value="text">
                <pre className="max-h-[560px] overflow-auto rounded-lg bg-muted/40 p-4 font-mono text-xs whitespace-pre-wrap">{doc.text_content.slice(0, 40000)}</pre>
              </TabsContent>
            </Tabs>
          </Card>
        )}
      </div>

      <Dialog open={paste.open} onOpenChange={(o) => setPaste({ ...paste, open: o })}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Paste text</DialogTitle>
            <DialogDescription>Add meeting notes, an email thread or any text as a document.</DialogDescription>
          </DialogHeader>
          <Input value={paste.name} onChange={(e) => setPaste({ ...paste, name: e.target.value })} placeholder="Document name" />
          <Textarea value={paste.text} onChange={(e) => setPaste({ ...paste, text: e.target.value })} className="min-h-64 [field-sizing:fixed]" placeholder="Paste text…" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaste({ ...paste, open: false })}>
              Cancel
            </Button>
            <Button onClick={savePaste} disabled={!paste.text.trim()}>
              Add document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
