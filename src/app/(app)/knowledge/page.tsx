"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BookOpen, Bot, Database, FileText, Plus, Search, Send, Trash2, Layers, Square, RefreshCcw, Type } from "lucide-react";
import { api, useStream } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EmptyState, GeneratingDots, Markdown, ModelSelect, PageHeader, StatCard, UserAvatar } from "@/components/shared";

type Source = { id: string; title: string; source_type: string; chunk_count: number; created_at: string; author?: { full_name: string | null } };
type Hit = { index?: number; title: string; excerpt?: string; content?: string; rank?: number };
type Msg = { role: "user" | "assistant"; content: string; sources?: Hit[] };

const STARTERS = ["What plans do we offer and how much do they cost?", "Summarize our company in two sentences", "Which file types can Document Intelligence read?", "How does the approval workflow work?"];

function Chat({ hasSources }: { hasSources: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("");
  const s = useStream();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const send = async (text = input) => {
    if (!text.trim() || s.streaming) return;
    setInput("");
    const history: Msg[] = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    let acc = "";
    await s.start("/api/knowledge/chat", { messages: history.map(({ role, content }) => ({ role, content })), model }, (e) => {
      if (e.type === "meta") setMessages((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, sources: e.sources } : x)));
      if (e.type === "text") {
        acc += e.text;
        setMessages((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, content: acc } : x)));
      }
    });
  };

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-center gap-3 border-b px-5 py-3">
        <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Bot className="size-4" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Knowledge assistant</div>
          <div className="text-xs text-muted-foreground">Answers are retrieved from your sources and cited</div>
        </div>
        <ModelSelect value={model} onChange={setModel} className="w-48" />
        {messages.length > 0 && (
          <Button variant="ghost" size="icon-sm" onClick={() => setMessages([])} aria-label="New chat">
            <RefreshCcw />
          </Button>
        )}
      </div>
      <div className="h-[520px] space-y-6 overflow-y-auto px-5 py-6">
        {!messages.length && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-5" />
            </div>
            <h3 className="mt-4 font-semibold">Ask your company knowledge</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {hasSources ? "Questions are matched against your knowledge sources, then answered by Claude with citations." : "Add sources first — paste text or add documents from Document Intelligence."}
            </p>
            <div className="mt-6 grid max-w-xl gap-2 sm:grid-cols-2">
              {STARTERS.map((x) => (
                <button key={x} onClick={() => send(x)} className="rounded-xl border px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground cursor-pointer">
                  {x}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
              {m.content}
            </div>
          ) : (
            <div key={i} className="flex gap-3">
              <div className="grid size-7 shrink-0 place-items-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                <Bot className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                {m.content ? <Markdown streaming={s.streaming && i === messages.length - 1}>{m.content}</Markdown> : <GeneratingDots label="Retrieving sources" />}
                {!!m.sources?.length && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {m.sources.map((src) => (
                      <div key={src.index} className="rounded-lg border bg-muted/30 p-2.5 text-xs">
                        <div className="flex items-center gap-1.5 font-medium">
                          <span className="grid size-4 place-items-center rounded bg-primary text-[10px] text-primary-foreground">{src.index}</span>
                          <span className="truncate">{src.title}</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-muted-foreground">{src.excerpt}</p>
                      </div>
                    ))}
                  </div>
                )}
                {m.sources && !m.sources.length && m.content && !s.streaming && (
                  <p className="text-xs text-muted-foreground">No matching sources found — answer may rely on general knowledge.</p>
                )}
              </div>
            </div>
          )
        )}
        {s.error && <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{s.error}</div>}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2 border-t p-4"
      >
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about products, pricing, policies…" />
        {s.streaming ? (
          <Button type="button" variant="outline" size="icon" onClick={s.stop}>
            <Square />
          </Button>
        ) : (
          <Button type="submit" size="icon" disabled={!input.trim()}>
            <Send />
          </Button>
        )}
      </form>
    </Card>
  );
}

export default function KnowledgePage() {
  const { user } = useAuth();
  const canWrite = user?.role !== "viewer";
  const kb = useApi<{ sources: Source[]; totalChunks: number }>("/api/knowledge");
  const [add, setAdd] = useState({ open: false, title: "", text: "", busy: false });
  const [view, setView] = useState<{ source: Source; chunks: { id: string; chunk_index: number; content: string }[] } | null>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [searching, setSearching] = useState(false);

  const sources = kb.data?.sources ?? [];

  const save = async () => {
    setAdd((a) => ({ ...a, busy: true }));
    try {
      await api("/api/knowledge", { body: { title: add.title, text: add.text } });
      toast.success("Source added and indexed");
      setAdd({ open: false, title: "", text: "", busy: false });
      kb.reload();
    } catch (e: any) {
      toast.error(e.message);
      setAdd((a) => ({ ...a, busy: false }));
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this source from the knowledge base?")) return;
    await api(`/api/knowledge/${id}`, { method: "DELETE" });
    kb.reload();
  };

  const open = async (s: Source) => {
    try {
      setView(await api(`/api/knowledge/${s.id}`));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const { results } = await api<{ results: Hit[] }>("/api/knowledge/search", { body: { query } });
      setHits(results);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      <PageHeader
        icon={BookOpen}
        title="Knowledge Base"
        description="Retrieval-augmented generation (RAG): your documents and notes are chunked, indexed and used to ground every answer."
        actions={
          canWrite && (
            <>
              <Button variant="outline" asChild>
                <Link href="/documents">
                  <FileText /> Add documents
                </Link>
              </Button>
              <Button onClick={() => setAdd({ ...add, open: true })}>
                <Plus /> Add source
              </Button>
            </>
          )
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Sources" value={sources.length} icon={Database} hint="documents & notes" />
        <StatCard label="Indexed chunks" value={kb.data?.totalChunks ?? 0} icon={Layers} hint="~1,200 characters each" />
        <StatCard label="Retrieval" value="Full-text" icon={Search} hint="Postgres ranking · pgvector-ready" />
      </div>

      <Tabs defaultValue="chat">
        <TabsList>
          <TabsTrigger value="chat">
            <Bot /> Ask
          </TabsTrigger>
          <TabsTrigger value="sources">
            <Database /> Sources
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search /> Retrieval test
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-2">
          <Chat hasSources={sources.length > 0} />
        </TabsContent>

        <TabsContent value="sources" className="mt-2">
          {kb.loading ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : !sources.length ? (
            <EmptyState
              icon={Database}
              title="No sources yet"
              description="Add product docs, FAQs, policies and case studies so AI answers use your facts."
              action={canWrite && <Button onClick={() => setAdd({ ...add, open: true })}>Add first source</Button>}
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {sources.map((s) => (
                <Card key={s.id} className="gap-3 p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">{s.source_type === "document" ? <FileText className="size-4" /> : <Type className="size-4" />}</div>
                    <div className="min-w-0 flex-1">
                      <button onClick={() => open(s)} className="truncate text-left text-sm font-semibold hover:text-primary cursor-pointer">
                        {s.title}
                      </button>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {s.chunk_count} chunks · {timeAgo(s.created_at)}
                      </div>
                    </div>
                    {canWrite && (
                      <Button variant="ghost" size="icon-sm" onClick={() => remove(s.id)} aria-label="Remove">
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {s.source_type}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <UserAvatar name={s.author?.full_name} className="size-5" /> {s.author?.full_name}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="search" className="mt-2">
          <Card>
            <CardHeader>
              <CardTitle>Test retrieval</CardTitle>
              <CardDescription>See exactly which chunks the model receives for a question.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  search();
                }}
                className="flex gap-2"
              >
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. enterprise pricing SSO" />
                <Button type="submit" disabled={searching}>
                  <Search /> Search
                </Button>
              </form>
              {hits && !hits.length && <p className="text-sm text-muted-foreground">No chunks matched. Try different keywords.</p>}
              <ol className="space-y-3">
                {hits?.map((h, i) => (
                  <li key={i} className="rounded-lg border p-3">
                    <div className="mb-1 flex items-center gap-2 text-xs">
                      <Badge variant="soft">#{i + 1}</Badge>
                      <span className="font-medium">{h.title}</span>
                      <span className="ml-auto text-muted-foreground tabular-nums">score {h.rank?.toFixed(3)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{h.content}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={add.open} onOpenChange={(o) => setAdd({ ...add, open: o })}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add knowledge source</DialogTitle>
            <DialogDescription>Paste product info, FAQs, policies or brand facts. It&apos;s chunked and indexed automatically.</DialogDescription>
          </DialogHeader>
          <Input value={add.title} onChange={(e) => setAdd({ ...add, title: e.target.value })} placeholder="Title, e.g. Pricing & plans" />
          <Textarea value={add.text} onChange={(e) => setAdd({ ...add, text: e.target.value })} className="min-h-64 [field-sizing:fixed]" placeholder="Paste content…" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdd({ ...add, open: false })}>
              Cancel
            </Button>
            <Button onClick={save} disabled={add.busy || !add.title.trim() || !add.text.trim()}>
              Add & index
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{view?.source.title}</SheetTitle>
            <SheetDescription>{view?.chunks.length} indexed chunks</SheetDescription>
          </SheetHeader>
          <div className="space-y-3 overflow-y-auto px-4 pb-6">
            {view?.chunks.map((c) => (
              <div key={c.id} className={cn("rounded-lg border p-3 text-sm")}>
                <div className="mb-1 text-xs font-medium text-muted-foreground">Chunk {c.chunk_index + 1}</div>
                {c.content}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
