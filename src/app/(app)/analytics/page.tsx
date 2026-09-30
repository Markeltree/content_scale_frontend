"use client";

import { useState } from "react";
import { ChartColumn, Zap, Coins, Type, Clock, FileText, Cpu, Table2 } from "lucide-react";
import { useApi } from "@/lib/use-api";
import { useAuth } from "@/lib/auth";
import type { Overview } from "@/lib/types";
import { CONTENT_TYPE_LABELS, STATUS_META, formatNumber } from "@/lib/utils";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaTrend, BarList, BarTrend } from "@/components/charts";
import { PageHeader, StatCard, UserAvatar } from "@/components/shared";

function Segmented<T extends string | number>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-lg bg-muted p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1 text-sm transition-colors cursor-pointer ${value === o.value ? "bg-card font-medium text-foreground shadow-xs ring-1 ring-border" : "text-muted-foreground"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [days, setDays] = useState(30);
  const [scope, setScope] = useState<"team" | "me">("team");
  const [showTable, setShowTable] = useState(false);
  const { data, loading } = useApi<Overview>(`/api/analytics/overview?days=${days}&scope=${scope}`, [days, scope]);
  const t = data?.totals;

  return (
    <div>
      <PageHeader
        icon={ChartColumn}
        title="Usage Analytics"
        description="Track AI adoption, output and cost across the workspace."
        actions={
          <>
            <Segmented value={scope} onChange={setScope} options={[{ value: "team", label: "Workspace" }, { value: "me", label: "Just me" }]} />
            <Segmented value={days} onChange={setDays} options={[{ value: 7, label: "7d" }, { value: 30, label: "30d" }, { value: 90, label: "90d" }]} />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {loading || !t ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[126px] rounded-xl" />)
        ) : (
          <>
            <StatCard label="Generations" value={formatNumber(t.generations)} change={t.generationsChange} icon={Zap} />
            <StatCard label="Tokens" value={formatNumber(t.tokens)} change={t.tokensChange} icon={Cpu} hint={`${formatNumber(t.outputTokens)} output`} />
            <StatCard label="Est. AI cost" value={`$${t.cost.toFixed(2)}`} icon={Coins} hint="at list prices" />
            <StatCard label="Words created" value={formatNumber(t.words)} change={t.wordsChange} icon={Type} />
            <StatCard label="Hours saved" value={`${t.hoursSaved}h`} icon={Clock} hint="est." />
            <StatCard label="Content items" value={t.contentCreated} change={t.contentChange} icon={FileText} />
          </>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Generations per day</CardTitle>
            <CardDescription>Requests sent to Claude</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" onClick={() => setShowTable((s) => !s)}>
                <Table2 /> {showTable ? "Chart" : "Table"}
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {!data ? (
              <Skeleton className="h-60" />
            ) : showTable ? (
              <div className="max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Generations</TableHead>
                      <TableHead className="text-right">Tokens</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...data.daily].reverse().map((d) => (
                      <TableRow key={d.date}>
                        <TableCell>{d.date}</TableCell>
                        <TableCell className="text-right tabular-nums">{d.generations}</TableCell>
                        <TableCell className="text-right tabular-nums">{d.tokens.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <AreaTrend data={data.daily} dataKey="generations" name="Generations" />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tokens per day</CardTitle>
            <CardDescription>Input + output tokens</CardDescription>
          </CardHeader>
          <CardContent>{data ? <BarTrend data={data.daily} dataKey="tokens" name="Tokens" height={240} /> : <Skeleton className="h-60" />}</CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>By capability</CardTitle>
            <CardDescription>Requests</CardDescription>
          </CardHeader>
          <CardContent>{data ? <BarList items={data.byFeature} /> : <Skeleton className="h-48" />}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>By model</CardTitle>
            <CardDescription>Tokens consumed</CardDescription>
          </CardHeader>
          <CardContent>{data ? <BarList items={data.byModel} valueFormat={formatNumber} /> : <Skeleton className="h-48" />}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Content by type</CardTitle>
            <CardDescription>All items in the library</CardDescription>
          </CardHeader>
          <CardContent>{data ? <BarList items={data.byType} labelFormat={(s) => CONTENT_TYPE_LABELS[s] ?? s} /> : <Skeleton className="h-48" />}</CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Workflow pipeline</CardTitle>
            <CardDescription>Items per stage</CardDescription>
          </CardHeader>
          <CardContent>{data ? <BarList items={data.byStatus} labelFormat={(s) => STATUS_META[s]?.label ?? s} /> : <Skeleton className="h-48" />}</CardContent>
        </Card>
        {user?.role === "admin" && scope === "team" && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top users</CardTitle>
              <CardDescription>By AI generations in this period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Generations</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Est. cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.topUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserAvatar name={u.full_name} src={u.avatar_url} />
                          <div>
                            <div className="font-medium">{u.full_name}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{u.role}</TableCell>
                      <TableCell className="text-right tabular-nums">{u.generations}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(u.tokens)}</TableCell>
                      <TableCell className="text-right tabular-nums">${u.cost.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
