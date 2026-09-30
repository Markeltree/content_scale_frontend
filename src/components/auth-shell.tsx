import Link from "next/link";
import { Sparkles, FileSearch, SquareKanban, ShieldCheck } from "lucide-react";
import { Logo, LogoMark } from "@/components/logo";

const points = [
  { icon: Sparkles, title: "Generate on-brand content", text: "Blogs, campaigns, emails and ads in your brand voice." },
  { icon: FileSearch, title: "Understand every document", text: "Summaries, extraction and Q&A grounded in your files." },
  { icon: SquareKanban, title: "Approve with confidence", text: "One board from draft to published." },
  { icon: ShieldCheck, title: "Governed by admins", text: "Model controls, roles and usage analytics." },
];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[1fr_minmax(0,560px)] xl:grid-cols-[1fr_minmax(0,620px)]">
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <Link href="/" className="w-fit rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo />
        </Link>
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[380px]">{children}</div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} ContentScale</span>
          <span>Secured by Supabase Auth</span>
        </div>
      </div>

      <div className="relative m-3 hidden overflow-hidden rounded-2xl bg-zinc-950 p-10 text-white lg:flex lg:flex-col xl:p-12">
        <div className="absolute inset-0 bg-grid opacity-[0.05]" />
        <div className="absolute -top-32 -right-24 size-[460px] rounded-full bg-primary/35 blur-[120px]" />
        <div className="absolute -bottom-40 -left-20 size-[380px] rounded-full bg-rose-400/10 blur-[120px]" />

        <div className="relative flex items-center gap-2 text-xs font-medium text-white/60">
          <LogoMark className="size-6 rounded-md" />
          Generative AI workspace
        </div>

        <div className="relative mt-auto">
          <h2 className="max-w-md text-[32px] leading-[1.15] font-semibold tracking-[-0.03em]">
            One AI workspace for every piece of content your team ships.
          </h2>
          <ul className="mt-10 space-y-5">
            {points.map((p) => (
              <li key={p.title} className="flex gap-4">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.06]">
                  <p.icon className="size-4 text-rose-300" />
                </div>
                <div>
                  <div className="text-sm font-medium">{p.title}</div>
                  <div className="mt-0.5 text-[13px] text-white/55">{p.text}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function AuthHeading({ title, description }: { title: string; description?: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-[-0.025em]">{title}</h1>
      {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
