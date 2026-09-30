import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number | undefined | null) {
  if (n == null) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  blog_post: "Blog article",
  website_copy: "Website copy",
  marketing_campaign: "Marketing campaign",
  social_media: "Social media",
  product_description: "Product description",
  email_campaign: "Email campaign",
  ad_copy: "Ad copy",
  press_release: "Press release",
};

export const STATUS_META: Record<string, { label: string; className: string; dot: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground ring-1 ring-inset ring-border", dot: "bg-zinc-400" },
  review: { label: "In Review", className: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/15 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20", dot: "bg-amber-500" },
  revision: { label: "Revision", className: "bg-orange-50 text-orange-800 ring-1 ring-inset ring-orange-600/15 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/20", dot: "bg-orange-500" },
  approved: { label: "Approved", className: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20", dot: "bg-emerald-500" },
  scheduled: { label: "Scheduled", className: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/15 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20", dot: "bg-sky-500" },
  published: { label: "Published", className: "bg-primary/8 text-primary ring-1 ring-inset ring-primary/20 dark:bg-primary/15", dot: "bg-primary" },
};

export const STATUSES = ["draft", "review", "revision", "approved", "scheduled", "published"] as const;
