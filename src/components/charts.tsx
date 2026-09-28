"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";
import { cn, formatNumber } from "@/lib/utils";

function TooltipBox({ active, payload, label, unit, labelFormat }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-medium text-foreground">{labelFormat ? labelFormat(label) : label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-muted-foreground">
          <span className="size-2 rounded-full" style={{ background: p.color || p.stroke || p.fill }} />
          <span>{p.name}</span>
          <span className="ml-auto pl-4 font-medium tabular-nums text-foreground">
            {Number(p.value).toLocaleString()}
            {unit ? ` ${unit}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

const fmtDay = (d: string) => {
  try {
    return format(parseISO(d), "MMM d");
  } catch {
    return d;
  }
};

/** Single-series trend over time (one hue, no legend needed — the card title names it). */
export function AreaTrend({
  data,
  dataKey,
  name,
  height = 240,
  color = "var(--color-chart-1)",
}: {
  data: any[];
  dataKey: string;
  name: string;
  height?: number;
  color?: string;
}) {
  const id = `grad-${dataKey}`;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="0" />
          <XAxis dataKey="date" tickFormatter={fmtDay} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} minTickGap={28} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickFormatter={(v) => formatNumber(v)} width={48} />
          <Tooltip content={<TooltipBox labelFormat={fmtDay} />} cursor={{ stroke: "var(--color-muted-foreground)", strokeDasharray: "3 3" }} />
          <Area type="monotone" dataKey={dataKey} name={name} stroke={color} strokeWidth={2} fill={`url(#${id})`} activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--color-card)" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Single-series vertical bars over time. */
export function BarTrend({ data, dataKey, name, height = 220 }: { data: any[]; dataKey: string; name: string; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barCategoryGap={3}>
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis dataKey="date" tickFormatter={fmtDay} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} minTickGap={28} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickFormatter={(v) => formatNumber(v)} width={48} />
          <Tooltip content={<TooltipBox labelFormat={fmtDay} />} cursor={{ fill: "var(--color-muted)", opacity: 0.6 }} />
          <Bar dataKey={dataKey} name={name} fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Ranked horizontal bars in plain HTML — labels in text ink, magnitude in one hue. */
export function BarList({
  items,
  valueFormat = (v: number) => v.toLocaleString(),
  labelFormat = (s: string) => s,
  className,
}: {
  items: { name: string; value: number }[];
  valueFormat?: (v: number) => string;
  labelFormat?: (s: string) => string;
  className?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.length) return <div className="py-8 text-center text-sm text-muted-foreground">No data yet</div>;
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((i) => (
        <li key={i.name} className="group" title={`${labelFormat(i.name)}: ${valueFormat(i.value)}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{labelFormat(i.name)}</span>
            <span className="shrink-0 font-medium tabular-nums">{valueFormat(i.value)}</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full bg-primary/85 transition-all group-hover:bg-primary" style={{ width: `${Math.max(2, (i.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
