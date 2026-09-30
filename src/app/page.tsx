import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  PenLine,
  ImagePlus,
  FileSearch,
  Braces,
  ShieldCheck,
  SquareKanban,
  BookOpen,
  CircleCheck,
  Zap,
  Brain,
  Database,
  Cpu,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { icon: Sparkles, title: "AI Content Generation", text: "Blog articles, website copy, campaigns, social posts, product descriptions and email — in your brand voice.", items: ["8 content types", "Brand voice built in", "Grounded with RAG"] },
  { icon: PenLine, title: "AI Writing Assistant", text: "Draft, improve and optimize written content with one-click editing actions.", items: ["Rewrite & tone", "Grammar & summaries", "SEO optimization"] },
  { icon: ImagePlus, title: "AI Image Studio", text: "Marketing visuals, social graphics, ad creatives and brand assets as editable vectors.", items: ["6 asset types", "SVG + PNG export", "Photoreal prompts"] },
  { icon: FileSearch, title: "Document Intelligence", text: "Upload PDFs and Word files to summarize, extract, classify, report and ask questions.", items: ["Structured extraction", "Classification", "Document Q&A"] },
  { icon: Braces, title: "Custom Prompt Workspace", text: "Shared prompt libraries, reusable variables and multi-step workflow templates.", items: ["Team library", "Prompt optimizer", "Chained workflows"] },
  { icon: SquareKanban, title: "Workflow & Approvals", text: "A six-stage board from draft to published, with comments, owners and AI review.", items: ["Role-based approvals", "Scheduling", "Quality scoring"] },
];

const STACK = [
  { icon: Brain, short: "LLM", label: "Large Language Models" },
  { icon: ImagePlus, short: "IGA", label: "Image Generation AI" },
  { icon: Database, short: "RAG", label: "Retrieval-Augmented Generation" },
  { icon: Cpu, short: "API", label: "API-first infrastructure" },
];

const OUTCOMES = [
  "Generate high-quality content at scale",
  "Automate repetitive creative tasks",
  "Improve team productivity",
  "Accelerate marketing and operations",
  "Enhance customer engagement",
  "Leverage AI for business growth",
];

function MockDashboard() {
  const cols = [
    { label: "Draft", n: 3, dot: "bg-zinc-400" },
    { label: "In Review", n: 2, dot: "bg-amber-500" },
    { label: "Approved", n: 4, dot: "bg-emerald-500" },
    { label: "Published", n: 6, dot: "bg-primary" },
  ];
  return (
    <div className="relative hidden rounded-2xl border bg-card p-2 shadow-xl sm:block">
      <div className="flex items-center gap-1.5 px-2 pb-2">
        <span className="size-2.5 rounded-full bg-rose-400" />
        <span className="size-2.5 rounded-full bg-amber-400" />
        <span className="size-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 text-[11px] text-muted-foreground">Content Workflow & Approvals</span>
      </div>
      <div className="grid grid-cols-[120px_1fr] gap-2 rounded-xl border bg-background p-2">
        <div className="space-y-1 rounded-lg bg-muted/50 p-2">
          {["Dashboard", "Generate", "Assistant", "Images", "Documents", "Knowledge", "Workflow"].map((x, i) => (
            <div key={x} className={`rounded-md px-2 py-1 text-[10px] ${i === 6 ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground"}`}>
              {x}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {cols.map((c) => (
            <div key={c.label} className="rounded-lg bg-muted/40 p-1.5">
              <div className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold">
                <span className={`size-1.5 rounded-full ${c.dot}`} /> {c.label}
                <span className="ml-auto text-muted-foreground">{c.n}</span>
              </div>
              {Array.from({ length: Math.min(3, c.n) }).map((_, i) => (
                <div key={i} className="mb-1.5 rounded-md border bg-card p-1.5">
                  <div className="h-1.5 w-2/3 rounded bg-muted-foreground/25" />
                  <div className="mt-1 h-1.5 w-full rounded bg-muted-foreground/15" />
                  <div className="mt-1.5 flex items-center justify-between">
                    <div className="h-1.5 w-6 rounded bg-primary/30" />
                    <div className="size-2.5 rounded-full bg-primary/20" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/75 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-5">
          <Logo />
          <nav className="ml-10 hidden gap-7 text-[13px] font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#outcomes" className="transition-colors hover:text-foreground">
              Outcomes
            </a>
          </nav>
          <div className="ml-auto flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/login">
                Live demo <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] opacity-60" />
        <div className="absolute top-0 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium shadow-xs">
              <Zap className="size-3.5 text-primary" /> Generative AI Services
            </span>
            <h1 className="mt-6 text-[40px] leading-[1.04] font-semibold tracking-[-0.04em] sm:text-5xl lg:text-[64px]">
              Create more.
              <br />
              <span className="bg-gradient-to-r from-primary to-rose-400 bg-clip-text pb-1 text-transparent">Coordinate less.</span>
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-muted-foreground">
              ContentScale unifies AI content generation, writing assistance, image creation, document intelligence and knowledge automation in one governed workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/login">
                  Explore the platform <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/signup">Create a workspace</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {["AI Content Generation", "AI Writing Assistants", "Image & Media Generation", "Document Intelligence", "Knowledge Automation"].map((t) => (
                <span key={t} className="rounded-md border bg-card px-2.5 py-1 text-xs text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <MockDashboard />
        </div>
      </section>

      <section className="bg-zinc-950 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-10 md:grid-cols-4">
          {STACK.map((s) => (
            <div key={s.short} className="flex items-center gap-3">
              <s.icon className="size-5 text-rose-300" />
              <div>
                <div className="text-base font-semibold tracking-tight">{s.short}</div>
                <div className="text-xs text-white/60">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-5 py-24">
        <p className="eyebrow text-primary">Platform</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-[40px] md:leading-tight">Everything your content team needs</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">Six integrated capabilities, one admin dashboard, and Claude under the hood.</p>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="group rounded-2xl border bg-card p-6 shadow-xs transition-all hover:border-foreground/15 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="grid size-10 place-items-center rounded-xl border bg-muted/50 text-foreground/80 transition-colors group-hover:border-primary/25 group-hover:bg-primary/8 group-hover:text-primary">
                  <f.icon className="size-5" />
                </div>
                <span className="font-mono text-xs text-muted-foreground/70">0{i + 1}</span>
              </div>
              <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              <ul className="mt-5 space-y-2 border-t pt-4">
                {f.items.map((x) => (
                  <li key={x} className="flex items-center gap-2 text-[13px]">
                    <CircleCheck className="size-3.5 text-primary" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="border-y bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-24 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="eyebrow text-primary">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-[40px] md:leading-tight">From brief to published</h2>
            <p className="mt-3 text-muted-foreground">Admins govern models, roles and approvals. Teams create with AI grounded in company knowledge.</p>
            <div className="mt-8 flex items-center gap-3 rounded-xl border bg-card p-4">
              <ShieldCheck className="size-8 text-primary" />
              <div className="text-sm">
                <div className="font-semibold">Admin dashboard included</div>
                <div className="text-muted-foreground">Model management, user administration, content monitoring, usage analytics and workflow control.</div>
              </div>
            </div>
          </div>
          <ol className="space-y-3">
            {[
              ["Ground", "Add documents and notes to the knowledge base — they're chunked and indexed for retrieval.", BookOpen],
              ["Generate", "Brief the AI; it drafts on-brand content using your facts and voice.", Sparkles],
              ["Refine", "Polish with the writing assistant, create visuals, and run an AI quality review.", PenLine],
              ["Approve & publish", "Move work across the approval board, schedule it, and track the impact.", SquareKanban],
            ].map(([t, d, Icon]: any, i) => (
              <li key={t} className="flex gap-4 rounded-2xl border bg-card p-5 shadow-xs">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-foreground font-mono text-xs font-medium text-background">0{i + 1}</span>
                <div>
                  <div className="flex items-center gap-2 font-semibold">
                    <Icon className="size-4 text-primary" /> {t}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="outcomes" className="mx-auto max-w-6xl px-5 py-24">
        <p className="eyebrow text-primary">Outcomes</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-[40px] md:leading-tight">Key outcomes</h2>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {OUTCOMES.map((o) => (
            <div key={o} className="flex items-center gap-3 rounded-xl border bg-card p-4 text-sm font-medium shadow-xs">
              <CircleCheck className="size-4.5 shrink-0 text-emerald-600 dark:text-emerald-400" /> {o}
            </div>
          ))}
        </div>
        <div className="relative mt-16 overflow-hidden rounded-3xl bg-zinc-950 p-10 text-white md:p-14">
          <div className="absolute -top-20 -right-20 size-80 rounded-full bg-primary/40 blur-[100px]" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">See it working on real content.</h3>
              <p className="mt-2 text-white/65">Sign in to the live demo workspace and try every feature.</p>
            </div>
            <Button asChild size="lg" className="bg-white text-zinc-900 hover:bg-white/90">
              <Link href="/login">
                Open live demo <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 py-8 text-[13px] text-muted-foreground sm:flex-row sm:items-center">
          <Logo />
          <span>© {new Date().getFullYear()} ContentScale · Generative AI Services</span>
        </div>
      </footer>
    </div>
  );
}
