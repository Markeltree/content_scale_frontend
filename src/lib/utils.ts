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
  draft: { label: "Draft", className: "bg-muted text-muted-foreground", dot: "bg-zinc-400" },
  review: { label: "In Review", className: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300", dot: "bg-amber-500" },
  revision: { label: "Revision", className: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300", dot: "bg-orange-500" },
  approved: { label: "Approved", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300", dot: "bg-emerald-500" },
  scheduled: { label: "Scheduled", className: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300", dot: "bg-sky-500" },
  published: { label: "Published", className: "bg-primary/10 text-primary", dot: "bg-primary" },
};

export const STATUSES = ["draft", "review", "revision", "approved", "scheduled", "published"] as const;
