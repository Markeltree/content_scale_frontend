"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Clock,
  FileSearch,
  ImagePlus,
  PenLine,
  Sparkles,
  BookOpen,
  Braces,
  Zap,
  Type,
  Eye,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/use-api";
import type { ContentItem, Overview } from "@/lib/types";
import { CONTENT_TYPE_LABELS, STATUS_META, formatNumber } from "@/lib/utils";
import { describeActivity, timeAgo } from "@/lib/format";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaTrend, BarList } from "@/components/charts";
import { EmptyState, StatCard, StatusBadge, UserAvatar } from "@/components/shared";

const QUICK = [
  { href: "/generate", icon: Sparkles, title: "Generate content", text: "Blogs, campaigns, emails & ads" },
  { href: "/assistant", icon: PenLine, title: "Writing assistant", text: "Rewrite, fix, summarize, SEO" },
  { href: "/images", icon: ImagePlus, title: "Image studio", text: "On-brand visual creatives" },
  { href: "/documents", icon: FileSearch, title: "Analyze a document", text: "Summaries, extraction, Q&A" },
  { href: "/knowledge", icon: BookOpen, title: "Ask the knowledge base", text: "RAG answers with citations" },
  { href: "/prompts", icon: Braces, title: "Prompt workspace", text: "Templates & workflows" },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading } = useApi<Overview>("/api/analytics/overview?days=30");
  const { data: recent } = useApi<{ items: ContentItem[] }>("/api/content?limit=6");
  const t = data?.totals;
  const statusTotal = data?.byStatus.reduce((a, s) => a + s.value, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-zinc-950 p-6 text-white md:p-8">
        <div className="absolute inset-0 bg-grid opacity-[0.06]" />
        <div className="absolute -top-24 right-0 size-80 rounded-full bg-primary/40 blur-[100px]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-white/60">{greeting()},</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{user?.full_name?.split(" ")[0] || "there"} 👋</h1>
            <p className="mt-2 max-w-lg text-sm text-white/65">
              Here&apos;s what your team produced with ContentScale in the last 30 days.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-white text-zinc-900 hover:bg-white/90">
              <Link href="/generate">
                <Sparkles /> New content
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
              <Link href="/workflow">Open board</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading || !t ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[126px] rounded-xl" />)
        ) : (
          <>
            <StatCard label="AI generations" value={formatNumber(t.generations)} change={t.generationsChange} icon={Zap} hint="vs previous 30 days" />
            <StatCard label="Words created" value={formatNumber(t.words)} change={t.wordsChange} icon={Type} hint="across all content" />
            <StatCard label="Est. hours saved" value={`${t.hoursSaved}h`} icon={Clock} hint="at 500 words / hour" />
            <StatCard label="Awaiting review" value={t.inReview} icon={Eye} hint={`${t.published} published in total`} />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>AI generations per day</CardTitle>
            <CardDescription>Every request to Claude across the workspace, last 30 days</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href="/analytics">
                  Analytics <ArrowUpRight />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>{data ? <AreaTrend data={data.daily} dataKey="generations" name="Generations" /> : <Skeleton className="h-60" />}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usage by capability</CardTitle>
            <CardDescription>Requests in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>{data ? <BarList items={data.byFeature.slice(0, 6)} /> : <Skeleton className="h-60" />}</CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK.map((q) => (
            <Link key={q.href} href={q.href} className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm">
              <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <q.icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{q.title}</div>
                <div className="truncate text-xs text-muted-foreground">{q.text}</div>
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent content</CardTitle>
            <CardDescription>Latest work across the workspace</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href="/library">
                  View all <ArrowUpRight />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {!recent ? (
              <Skeleton className="h-48" />
            ) : recent.items.length === 0 ? (
              <EmptyState
                icon={LayoutDashboard}
                title="No content yet"
                description="Generate your first piece, or an admin can load demo data from the Admin dashboard."
                action={
                  <Button asChild size="sm">
                    <Link href="/generate">Generate content</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y">
                {recent.items.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <Link href={`/library?open=${c.id}`} className="flex items-center gap-3 py-3 hover:opacity-80">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{c.title}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {CONTENT_TYPE_LABELS[c.type] ?? c.type} · {c.word_count.toLocaleString()} words · {timeAgo(c.updated_at)}
                        </div>
                      </div>
                      <StatusBadge status={c.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content pipeline</CardTitle>
              <CardDescription>{statusTotal} items across all stages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-muted">
                {data?.byStatus
                  .filter((s) => s.value)
                  .map((s) => (
                    <div key={s.name} className={STATUS_META[s.name].dot} style={{ width: `${(s.value / Math.max(1, statusTotal)) * 100}%` }} title={`${STATUS_META[s.name].label}: ${s.value}`} />
                  ))}
              </div>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {data?.byStatus.map((s) => (
                  <li key={s.name} className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${STATUS_META[s.name].dot}`} />
                    <span className="text-muted-foreground">{STATUS_META[s.name].label}</span>
                    <span className="ml-auto font-medium tabular-nums">{s.value}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Team activity</CardTitle>
            </CardHeader>
            <CardContent>
              {!data?.activity.length ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                <ul className="space-y-4">
                  {data.activity.slice(0, 6).map((a) => (
                    <li key={a.id} className="flex gap-3 text-sm">
                      <UserAvatar name={a.actor?.full_name} src={a.actor?.avatar_url} />
                      <div className="min-w-0">
                        <p className="leading-snug">
                          <span className="font-medium">{a.actor?.full_name ?? "Someone"}</span>{" "}
                          <span className="text-muted-foreground">{describeActivity(a)}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(a.created_at)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
