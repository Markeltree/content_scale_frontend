"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Sparkles,
  Newspaper,
  Globe,
  Megaphone,
  Share2,
  ShoppingBag,
  Mail,
  Target,
  FileText,
  Lightbulb,
  LoaderCircle,
  Square,
  Send,
  RefreshCcw,
  BookOpen,
  PenLine,
  Check,
} from "lucide-react";
import { api, useStream } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CopyButton, DownloadButton, EmptyState, Field, GeneratingDots, Markdown, ModelSelect, PageHeader } from "@/components/shared";

const TYPES = [
  { id: "blog_post", label: "Blog article", icon: Newspaper },
  { id: "website_copy", label: "Website copy", icon: Globe },
  { id: "marketing_campaign", label: "Campaign", icon: Megaphone },
  { id: "social_media", label: "Social posts", icon: Share2 },
  { id: "product_description", label: "Product copy", icon: ShoppingBag },
  { id: "email_campaign", label: "Email", icon: Mail },
  { id: "ad_copy", label: "Ad copy", icon: Target },
  { id: "press_release", label: "Press release", icon: FileText },
];
const TONES = ["Professional", "Friendly", "Persuasive", "Authoritative", "Playful", "Inspirational", "Conversational", "Technical"];

type Idea = { title: string; angle: string; audience: string };

export default function GeneratePage() {
  const [form, setForm] = useState({
    type: "blog_post",
    topic: "",
    audience: "",
    tone: "Professional",
    length: "medium",
    keywords: "",
    instructions: "",
    useBrandVoice: true,
    useKnowledge: true,
    model: "",
  });
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const s = useStream();
  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const generate = () => {
    if (!form.topic.trim()) return toast.error("Add a topic or brief first");
    setSubmitted(false);
    s.start("/api/generate/content", form);
  };

  const suggest = async () => {
    setIdeasLoading(true);
    try {
      const { ideas } = await api<{ ideas: Idea[] }>("/api/generate/ideas", { body: { type: form.type, niche: form.topic } });
      setIdeas(ideas);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIdeasLoading(false);
    }
  };

  const submitForReview = async () => {
    if (!s.done?.contentId) return;
    try {
      await api(`/api/content/${s.done.contentId}`, { method: "PATCH", body: { status: "review" } });
      setSubmitted(true);
      toast.success("Sent to review on the workflow board");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const words = (s.text.trim().match(/\S+/g) || []).length;
  const stage = s.streaming ? (s.text ? 2 : 1) : s.done ? 3 : 0;
  const sources: { title: string; excerpt: string }[] = s.meta?.sources ?? [];

  return (
    <div>
      <PageHeader
        icon={Sparkles}
        title="AI Content Generation"
        description="Turn a brief into publish-ready content for any channel — written in your brand voice and grounded in your knowledge base."
      />

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Content brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label="Content type">
              <div className="grid grid-cols-4 gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => set("type", t.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border px-1 py-2.5 text-[11px] font-medium transition-colors cursor-pointer",
                      form.type === t.id ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                    )}
                  >
                    <t.icon className="size-4" />
                    <span className="text-center leading-tight">{t.label}</span>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Topic or brief" hint={`${form.topic.length}/2000`}>
              <Textarea
                value={form.topic}
                maxLength={2000}
                onChange={(e) => set("topic", e.target.value)}
                placeholder="e.g. How AI content automation helps B2B marketing teams ship campaigns 3x faster"
                className="min-h-24"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="-ml-2 text-primary" onClick={() => !ideas.length && suggest()}>
                    {ideasLoading ? <LoaderCircle className="animate-spin" /> : <Lightbulb />} Suggest ideas
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-96 p-2">
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-sm font-medium">Topic ideas</span>
                    <Button variant="ghost" size="icon-sm" onClick={suggest} disabled={ideasLoading}>
                      <RefreshCcw className={cn(ideasLoading && "animate-spin")} />
                    </Button>
                  </div>
                  {ideasLoading && !ideas.length ? (
                    <div className="p-3">
                      <GeneratingDots label="Brainstorming" />
                    </div>
                  ) : (
                    <ul className="max-h-80 overflow-y-auto">
                      {ideas.map((i) => (
                        <li key={i.title}>
                          <button
                            className="w-full rounded-md px-2 py-2 text-left hover:bg-accent cursor-pointer"
                            onClick={() => setForm((f) => ({ ...f, topic: `${i.title} — ${i.angle}`, audience: f.audience || i.audience }))}
                          >
                            <div className="text-sm font-medium">{i.title}</div>
                            <div className="text-xs text-muted-foreground">{i.angle}</div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </PopoverContent>
              </Popover>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Audience">
                <Input value={form.audience} onChange={(e) => set("audience", e.target.value)} placeholder="Marketing leaders" />
              </Field>
              <Field label="Tone">
                <Select value={form.tone} onValueChange={(v) => set("tone", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Length">
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
                {["short", "medium", "long"].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => set("length", l)}
                    className={cn("rounded-md py-1.5 text-sm capitalize transition-colors cursor-pointer", form.length === l ? "bg-background font-medium shadow-sm" : "text-muted-foreground")}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Keywords" hint="comma separated">
              <Input value={form.keywords} onChange={(e) => set("keywords", e.target.value)} placeholder="content automation, AI workflows" />
            </Field>

            <Field label="Extra instructions" hint="optional">
              <Textarea value={form.instructions} onChange={(e) => set("instructions", e.target.value)} placeholder="Include a customer example and end with a demo CTA" className="min-h-16" />
            </Field>

            <div className="space-y-3 rounded-lg border p-3">
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="font-medium">Brand voice</span>
                  <span className="block text-xs text-muted-foreground">Apply workspace voice guidelines</span>
                </span>
                <Switch checked={form.useBrandVoice} onCheckedChange={(v) => set("useBrandVoice", v)} />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="font-medium">Knowledge base (RAG)</span>
                  <span className="block text-xs text-muted-foreground">Ground facts in your company sources</span>
                </span>
                <Switch checked={form.useKnowledge} onCheckedChange={(v) => set("useKnowledge", v)} />
              </label>
            </div>

            <Field label="Model">
              <ModelSelect value={form.model} onChange={(v) => set("model", v)} />
            </Field>

            {s.streaming ? (
              <Button variant="outline" className="w-full" onClick={s.stop}>
                <Square /> Stop generating
              </Button>
            ) : (
              <Button className="w-full" size="lg" onClick={generate}>
                <Sparkles /> Generate content
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="min-h-[640px] gap-0 py-0">
          <div className="flex flex-wrap items-center gap-3 border-b px-5 py-3">
            <ol className="flex items-center gap-2 text-xs">
              {["Brief", "Retrieving", "Drafting", "Saved"].map((label, i) => (
                <li key={label} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2 py-1 font-medium",
                      stage > i || (stage === 3 && i === 3) ? "bg-primary/10 text-primary" : stage === i && s.streaming ? "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" : "text-muted-foreground"
                    )}
                  >
                    {stage > i || (stage === 3 && i === 3) ? <Check className="size-3" /> : <span className="size-1.5 rounded-full bg-current" />}
                    {label}
                  </span>
                  {i < 3 && <span className="h-px w-3 bg-border" />}
                </li>
              ))}
            </ol>
            <div className="ml-auto flex items-center gap-2">
              {words > 0 && <Badge variant="secondary">{words.toLocaleString()} words</Badge>}
              <CopyButton text={s.text} />
              <DownloadButton filename="contentscale-draft.md" text={s.text} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
            {s.error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{s.error}</div>}
            {!s.text && !s.streaming && !s.error && (
              <EmptyState
                icon={PenLine}
                title="Your draft will appear here"
                description="Pick a content type, describe what you need, and ContentScale will stream a first draft in seconds."
                className="h-full border-0"
              />
            )}
            {s.streaming && !s.text && <GeneratingDots label={form.useKnowledge ? "Searching the knowledge base and drafting…" : "Drafting…"} />}
            {s.text && <Markdown streaming={s.streaming}>{s.text}</Markdown>}
          </div>

          {(sources.length > 0 || s.done) && (
            <div className="space-y-3 border-t bg-muted/30 px-5 py-4">
              {sources.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 font-medium text-muted-foreground">
                    <BookOpen className="size-3.5" /> Grounded in:
                  </span>
                  {sources.map((src, i) => (
                    <Badge key={i} variant="outline" title={src.excerpt}>
                      {src.title}
                    </Badge>
                  ))}
                </div>
              )}
              {s.done && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-auto text-sm text-muted-foreground">
                    Saved to your library as a <span className="font-medium text-foreground">{submitted ? "review item" : "draft"}</span>.
                  </span>
                  <Button variant="outline" size="sm" onClick={generate}>
                    <RefreshCcw /> Regenerate
                  </Button>
                  {s.done.contentId && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/library?open=${s.done.contentId}`}>Open in library</Link>
                    </Button>
                  )}
                  <Button size="sm" onClick={submitForReview} disabled={submitted || !s.done.contentId}>
                    <Send /> {submitted ? "In review" : "Submit for review"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
