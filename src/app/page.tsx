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
  Lock,
  Users,
  Gauge,
  Plus,
  Megaphone,
  Building2,
  Settings2,
  BadgeCheck,
  MessageSquareText,
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

const STEPS = [
  { title: "Ground", text: "Add documents and notes to the knowledge base — they're chunked and indexed for retrieval.", icon: BookOpen },
  { title: "Generate", text: "Brief the AI; it drafts on-brand content using your facts and voice.", icon: Sparkles },
  { title: "Refine", text: "Polish with the writing assistant, create visuals, and run an AI quality review.", icon: PenLine },
  { title: "Approve & publish", text: "Move work across the approval board, schedule it, and track the impact.", icon: SquareKanban },
];

const FACTS = [
  { value: "8", label: "Content types" },
  { value: "6", label: "Image asset types" },
  { value: "6", label: "Workflow stages" },
  { value: "1", label: "Governed workspace" },
];

const TEAMS = [
  { icon: Megaphone, title: "Marketing", text: "Campaigns, social posts, ad creatives and email — on brand and on schedule." },
  { icon: PenLine, title: "Content & editorial", text: "Draft, refine and review long-form content with AI quality scoring." },
  { icon: Settings2, title: "Operations", text: "Turn documents into summaries, structured data and reports automatically." },
  { icon: Building2, title: "Leadership", text: "See output, usage and approvals across the workspace in one dashboard." },
];

const FAQ = [
  { q: "Which AI models power ContentScale?", a: "ContentScale runs on Claude. Admins choose the default model for the workspace, and users can pick a model per task where allowed." },
  { q: "Does the AI use our company knowledge?", a: "Yes. Documents and notes added to the knowledge base are chunked and indexed, and generation is grounded with retrieval-augmented generation (RAG)." },
  { q: "How do approvals work?", a: "Content moves across a six-stage board from draft to published, with owners, comments, role-based approvals and an AI review step." },
  { q: "What formats can images be exported in?", a: "The Image Studio produces editable vector assets that can be exported as SVG or PNG." },
  { q: "Can I try it before setting up a workspace?", a: "Yes. Sign in to the live demo workspace to try every feature, or create your own workspace when you're ready." },
];

const GOVERNANCE = [
  { icon: Gauge, text: "Model management" },
  { icon: Users, text: "User administration" },
  { icon: Lock, text: "Role-based approvals" },
];

function SectionHeading({ eyebrow, title, text, center = false }: { eyebrow: string; title: string; text?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow inline-flex items-center gap-2 text-primary">
        <span className="h-px w-5 bg-primary/50" />
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-[40px] md:leading-tight">{title}</h2>
      {text && <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{text}</p>}
    </div>
  );
}

function MockDashboard() {
  const cols = [
    { label: "Draft", n: 3, dot: "bg-zinc-400" },
    { label: "In Review", n: 2, dot: "bg-amber-500" },
    { label: "Approved", n: 4, dot: "bg-emerald-500" },
    { label: "Published", n: 6, dot: "bg-primary" },
  ];
  return (
    <div className="relative hidden sm:block">
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-primary/15 via-transparent to-rose-400/15 blur-2xl" />
      <div className="relative rounded-2xl border bg-card/90 p-2 shadow-xl ring-1 ring-foreground/[0.03] backdrop-blur">
        <div className="flex items-center gap-1.5 px-2 pb-2">
          <span className="size-2.5 rounded-full bg-rose-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
          <span className="mx-auto flex h-5 w-1/2 items-center justify-center gap-1.5 rounded-md border bg-muted/50 text-[10px] text-muted-foreground">
            <Lock className="size-2.5" /> Content Workflow & Approvals
          </span>
          <span className="w-10" />
        </div>
        <div className="grid grid-cols-[112px_1fr] gap-2 rounded-xl border bg-background p-2">
          <div className="space-y-1 rounded-lg bg-muted/50 p-2">
            {["Dashboard", "Generate", "Assistant", "Images", "Documents", "Knowledge", "Workflow"].map((x, i) => (
              <div key={x} className={`rounded-md px-2 py-1 text-[10px] ${i === 6 ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground"}`}>
                {x}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {[
                ["Generations", "1.2k"],
                ["Words", "84k"],
                ["Hours saved", "168h"],
              ].map(([l, v]) => (
                <div key={l} className="rounded-lg border bg-card px-2 py-1.5">
                  <div className="text-[9px] text-muted-foreground">{l}</div>
                  <div className="text-xs font-semibold tabular-nums">{v}</div>
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
                    <div key={i} className="mb-1.5 rounded-md border bg-card p-1.5 shadow-xs">
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
      </div>
      <div className="absolute -bottom-6 -left-6 flex items-center gap-2.5 rounded-xl border bg-card px-3 py-2.5 shadow-lg animate-in fade-in slide-in-from-bottom-2 delay-300 duration-700 fill-mode-both">
        <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
          <BadgeCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
        </span>
        <div>
          <div className="text-[11px] text-muted-foreground">AI quality review</div>
          <div className="text-xs font-semibold">Approved for publishing</div>
        </div>
      </div>
      <div className="absolute -top-5 -right-4 flex items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-lg animate-in fade-in slide-in-from-top-2 delay-500 duration-700 fill-mode-both">
        <Sparkles className="size-4 text-primary" />
        <span className="text-xs font-medium">Drafting in brand voice…</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/75 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-5">
          <Logo />
          <nav className="ml-10 hidden gap-1 text-[13px] font-medium text-muted-foreground md:flex">
            {[
              ["#features", "Features"],
              ["#how", "How it works"],
              ["#outcomes", "Outcomes"],
              ["#faq", "FAQ"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="rounded-md px-3 py-1.5 transition-colors hover:bg-muted hover:text-foreground">
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="shadow-sm shadow-primary/20">
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
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 lg:grid-cols-[1fr_1.05fr] lg:py-28">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-1 text-xs font-medium shadow-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                <Zap className="size-3" /> AI
              </span>
              Generative AI Services
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
              <Button asChild size="lg" className="shadow-md shadow-primary/20">
                <Link href="/login">
                  Explore the platform <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-card">
                <Link href="/signup">Create a workspace</Link>
              </Button>
            </div>
            <div className="mt-10 border-t pt-6">
              <p className="eyebrow">Capabilities</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {["AI Content Generation", "AI Writing Assistants", "Image & Media Generation", "Document Intelligence", "Knowledge Automation"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <CircleCheck className="size-3.5 text-primary" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-6 delay-150 duration-1000 fill-mode-both">
            <MockDashboard />
          </div>
        </div>
        <div className="relative mx-auto max-w-6xl px-5 pb-16">
          <dl className="grid grid-cols-2 divide-border overflow-hidden rounded-2xl border bg-card/80 shadow-xs backdrop-blur md:grid-cols-4 md:divide-x">
            {FACTS.map((f, i) => (
              <div key={f.label} className={`px-6 py-5 ${i < 2 ? "border-b md:border-b-0" : ""} ${i % 2 === 0 ? "border-r md:border-r-0" : ""}`}>
                <dt className="text-[13px] text-muted-foreground">{f.label}</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-[-0.03em] tabular-nums">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-zinc-950 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:gap-10">
          <p className="shrink-0 text-[11px] font-medium tracking-[0.08em] text-white/50 uppercase">Built on</p>
          <div className="grid flex-1 grid-cols-2 gap-6 md:grid-cols-4 md:gap-0 md:divide-x md:divide-white/10">
            {STACK.map((s) => (
              <div key={s.short} className="flex items-center gap-3 md:px-6 md:first:pl-0">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/5 ring-1 ring-white/10">
                  <s.icon className="size-[18px] text-rose-300" />
                </div>
                <div>
                  <div className="text-base font-semibold tracking-tight">{s.short}</div>
                  <div className="text-xs text-white/60">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-24">
        <SectionHeading center eyebrow="Platform" title="Everything your content team needs" text="Six integrated capabilities, one admin dashboard, and Claude under the hood." />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-xs transition-all hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-lg">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="flex items-center justify-between">
                <div className="grid size-11 place-items-center rounded-xl border bg-muted/50 text-foreground/80 transition-colors group-hover:border-primary/25 group-hover:bg-primary/8 group-hover:text-primary">
                  <f.icon className="size-5" />
                </div>
                <span className="font-mono text-xs text-muted-foreground/60">0{i + 1}</span>
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

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="grid gap-10 rounded-3xl border bg-card p-8 shadow-xs md:p-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading eyebrow="Who it's for" title="Built for every team that creates" />
            <Button asChild variant="outline" className="mt-8">
              <Link href="/signup">
                Create a workspace <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2">
            {TEAMS.map((t) => (
              <div key={t.title} className="bg-card p-5 transition-colors hover:bg-muted/40">
                <t.icon className="size-5 text-primary" />
                <h3 className="mt-3 text-[15px] font-semibold">{t.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="scroll-mt-16 border-y bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 lg:grid-cols-[1fr_1.3fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <SectionHeading eyebrow="How it works" title="From brief to published" text="Admins govern models, roles and approvals. Teams create with AI grounded in company knowledge." />
            <div className="mt-8 rounded-2xl border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="font-semibold">Admin dashboard included</div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Model management, user administration, content monitoring, usage analytics and workflow control.</p>
              <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                {GOVERNANCE.map((g) => (
                  <span key={g.text} className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                    <g.icon className="size-3.5" /> {g.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <ol className="relative space-y-3">
            <span aria-hidden className="absolute top-8 bottom-8 left-[38px] w-px bg-border" />
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative flex gap-4 rounded-2xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-md">
                <span className="relative grid size-9 shrink-0 place-items-center rounded-lg bg-foreground font-mono text-xs font-medium text-background ring-4 ring-card">0{i + 1}</span>
                <div>
                  <div className="flex items-center gap-2 font-semibold">
                    <s.icon className="size-4 text-primary" /> {s.title}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="outcomes" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-24">
        <SectionHeading center eyebrow="Outcomes" title="Key outcomes" />
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {OUTCOMES.map((o) => (
            <div key={o} className="flex items-center gap-3 rounded-xl border bg-card p-4 text-sm font-medium shadow-xs transition-colors hover:border-foreground/15">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                <CircleCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              </span>
              {o}
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="scroll-mt-16 border-y bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-24 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading eyebrow="FAQ" title="Questions, answered" text="Everything you need to know before you open the live demo." />
            <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
              <MessageSquareText className="size-5 text-primary" />
              <span>
                Still curious?{" "}
                <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
                  Try it yourself
                </Link>
              </span>
            </div>
          </div>
          <div className="divide-y rounded-2xl border bg-card shadow-xs">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-medium">
                  {f.q}
                  <Plus className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45" />
                </summary>
                <p className="-mt-1 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 p-10 text-white shadow-xl md:p-14">
          <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_right,black,transparent_70%)]" />
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

      <footer className="border-t bg-muted/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Logo />
            <p>© {new Date().getFullYear()} ContentScale · Generative AI Services</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#outcomes" className="transition-colors hover:text-foreground">
              Outcomes
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </a>
            <Link href="/login" className="transition-colors hover:text-foreground">
              Sign in
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
