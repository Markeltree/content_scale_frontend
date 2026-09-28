import Link from "next/link";
import { Sparkles, FileSearch, SquareKanban, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";

const points = [
  { icon: Sparkles, title: "Generate on-brand content", text: "Blogs, campaigns, emails and ads in your brand voice." },
  { icon: FileSearch, title: "Understand every document", text: "Summaries, extraction and Q&A grounded in your files." },
  { icon: SquareKanban, title: "Approve with confidence", text: "One board from draft to published." },
  { icon: ShieldCheck, title: "Governed by admins", text: "Model controls, roles and usage analytics." },
];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-zinc-950 p-10 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-grid opacity-[0.07]" />
        <div className="absolute -top-40 -left-24 size-[520px] rounded-full bg-primary/40 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 size-[420px] rounded-full bg-rose-400/20 blur-[120px]" />
        <Link href="/" className="relative">
          <Logo className="[&_.text-muted-foreground]:text-white/50" />
        </Link>
        <div className="relative mt-auto max-w-lg">
          <h2 className="text-4xl leading-tight font-bold tracking-tight">
            One AI workspace for every piece of content your team ships.
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {points.map((p) => (
              <div key={p.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p.icon className="size-5 text-rose-300" />
                <div className="mt-3 text-sm font-semibold">{p.title}</div>
                <div className="mt-1 text-xs text-white/60">{p.text}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative mt-10 text-xs text-white/40">© {new Date().getFullYear()} ContentScale</div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 inline-block lg:hidden">
            <Logo />
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
