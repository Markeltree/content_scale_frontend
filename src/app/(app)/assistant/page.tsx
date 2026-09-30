"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  PenLine,
  WandSparkles,
  SpellCheck,
  Palette,
  ListChecks,
  Maximize2,
  Minimize2,
  Search,
  Languages,
  Heading,
  ArrowLeft,
  Square,
  Clock,
} from "lucide-react";
import { useStream } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CopyButton, EmptyState, GeneratingDots, Markdown, ModelSelect, PageHeader } from "@/components/shared";

const ACTIONS = [
  { id: "rewrite", label: "Rewrite", icon: WandSparkles, desc: "Clearer and more engaging" },
  { id: "grammar", label: "Fix grammar", icon: SpellCheck, desc: "Spelling & punctuation" },
  { id: "tone", label: "Adjust tone", icon: Palette, desc: "Match a tone of voice" },
  { id: "summarize", label: "Summarize", icon: ListChecks, desc: "TL;DR + key points" },
  { id: "expand", label: "Expand", icon: Maximize2, desc: "Add depth and examples" },
  { id: "shorten", label: "Shorten", icon: Minimize2, desc: "Cut length by half" },
  { id: "seo", label: "SEO optimize", icon: Search, desc: "Keywords, meta & headings" },
  { id: "translate", label: "Translate", icon: Languages, desc: "Into another language" },
  { id: "headline", label: "Headlines", icon: Heading, desc: "10 headline options" },
];
const TONES = ["Professional", "Friendly", "Confident", "Empathetic", "Playful", "Formal", "Persuasive", "Casual"];
const LANGS = ["Spanish", "French", "German", "Arabic", "Urdu", "Portuguese", "Italian", "Japanese", "Chinese (Simplified)"];

const SAMPLE = `our new platform help teams to create content more faster. It have many feature like AI generation, approvals and analytics which makes the life of marketing team much more easy. We think its the best tool in market for companys who wants to scale there content.`;

function stats(text: string) {
  const words = (text.trim().match(/\S+/g) || []).length;
  const sentences = Math.max(1, (text.match(/[.!?]+(\s|$)/g) || []).length);
  return { words, sentences, avg: words ? Math.round(words / sentences) : 0, read: Math.max(1, Math.round(words / 230)) };
}

export default function AssistantPage() {
  const [text, setText] = useState("");
  const [action, setAction] = useState("rewrite");
  const [tone, setTone] = useState("Friendly");
  const [keywords, setKeywords] = useState("");
  const [language, setLanguage] = useState("Spanish");
  const [instructions, setInstructions] = useState("");
  const [useBrandVoice, setUseBrandVoice] = useState(true);
  const [model, setModel] = useState("");
  const [history, setHistory] = useState<{ action: string; output: string }[]>([]);
  const s = useStream();

  const inStats = useMemo(() => stats(text), [text]);
  const outStats = useMemo(() => stats(s.text), [s.text]);

  const run = async (id = action) => {
    if (!text.trim()) return toast.error("Paste or type some text first");
    setAction(id);
    let acc = "";
    await s.start(
      "/api/assistant",
      {
        action: id,
        text,
        tone: id === "tone" ? tone : undefined,
        keywords: id === "seo" ? keywords : undefined,
        language: id === "translate" ? language : undefined,
        instructions,
        useBrandVoice,
        model,
      },
      (e) => {
        if (e.type === "text") acc += e.text;
        if (e.type === "done") setHistory((h) => [{ action: id, output: acc }, ...h].slice(0, 8));
      }
    );
  };

  const current = ACTIONS.find((a) => a.id === action)!;

  return (
    <div>
      <PageHeader
        icon={PenLine}
        title="AI Writing Assistant"
        description="Rewrite, correct, adjust tone, summarize, expand and optimize any text for SEO — with one click."
        actions={
          <div className="flex items-center gap-2">
            <ModelSelect value={model} onChange={setModel} className="w-52" />
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAction(a.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border bg-card px-2 py-3 text-xs font-medium transition-all cursor-pointer",
              action === a.id ? "border-primary/60 bg-primary/5 ring-1 ring-primary/15 text-primary shadow-sm" : "text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            )}
          >
            <a.icon className="size-4" />
            {a.label}
          </button>
        ))}
      </div>

      <Card className="mb-4 py-4">
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="mr-auto text-sm">
            <span className="font-medium">{current.label}</span>
            <span className="text-muted-foreground"> — {current.desc}</span>
          </div>
          {action === "tone" && (
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger size="sm" className="w-40">
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
          )}
          {action === "seo" && <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Target keywords" className="h-8 w-60" />}
          {action === "translate" && (
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger size="sm" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Input value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Extra instructions (optional)" className="h-8 w-64" />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Switch checked={useBrandVoice} onCheckedChange={setUseBrandVoice} /> Brand voice
          </label>
          {s.streaming ? (
            <Button size="sm" variant="outline" onClick={s.stop}>
              <Square /> Stop
            </Button>
          ) : (
            <Button size="sm" onClick={() => run()}>
              <current.icon /> {current.label}
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-0 py-0">
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <span className="text-sm font-medium">Original</span>
            <div className="flex items-center gap-2">
              {!text && (
                <Button variant="ghost" size="sm" onClick={() => setText(SAMPLE)}>
                  Try a sample
                </Button>
              )}
              <Badge variant="secondary">{inStats.words} words</Badge>
            </div>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or write your text here…"
            className="min-h-[440px] resize-none rounded-none border-0 px-4 py-4 shadow-none focus-visible:ring-0 [field-sizing:fixed]"
          />
          <div className="flex gap-4 border-t px-4 py-2 text-xs text-muted-foreground">
            <span>{inStats.sentences} sentences</span>
            <span>~{inStats.avg} words/sentence</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" /> {inStats.read} min read
            </span>
          </div>
        </Card>

        <Card className="gap-0 py-0">
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <span className="text-sm font-medium">Result</span>
            <div className="flex items-center gap-2">
              {s.text && !s.streaming && (
                <Button variant="ghost" size="sm" onClick={() => setText(s.text)}>
                  <ArrowLeft /> Use as original
                </Button>
              )}
              <CopyButton text={s.text} />
            </div>
          </div>
          <div className="min-h-[440px] flex-1 overflow-y-auto px-5 py-4">
            {s.error && <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{s.error}</div>}
            {!s.text && !s.streaming && !s.error && (
              <EmptyState icon={WandSparkles} title="Pick an action" description="Choose what you want to do with your text, then run it." className="h-full border-0" />
            )}
            {s.streaming && !s.text && <GeneratingDots label={`${current.label}…`} />}
            {s.text && <Markdown streaming={s.streaming}>{s.text}</Markdown>}
          </div>
          <div className="flex gap-4 border-t px-4 py-2 text-xs text-muted-foreground">
            <span>{outStats.words} words</span>
            {inStats.words > 0 && outStats.words > 0 && (
              <span>
                {outStats.words >= inStats.words ? "+" : ""}
                {Math.round(((outStats.words - inStats.words) / inStats.words) * 100)}% vs original
              </span>
            )}
          </div>
        </Card>
      </div>

      {history.length > 1 && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Earlier results this session</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {history
              .slice(1)
              .map((h, i) => (
                <Card key={i} className="gap-2 p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="soft">{ACTIONS.find((a) => a.id === h.action)?.label}</Badge>
                    <CopyButton text={h.output} />
                  </div>
                  <p className="line-clamp-4 text-sm text-muted-foreground">{h.output}</p>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
