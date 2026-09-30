"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ImagePlus,
  Megaphone,
  ShoppingBag,
  Lightbulb,
  Share2,
  Target,
  Gem,
  Sparkles,
  Download,
  Trash2,
  Square,
  Images,
  Lock,
  Copy,
} from "lucide-react";
import { useStream, api } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState, Field, ModelSelect, PageHeader } from "@/components/shared";

const CATS = [
  { id: "marketing_visual", label: "Marketing visual", icon: Megaphone },
  { id: "product_imagery", label: "Product imagery", icon: ShoppingBag },
  { id: "concept_art", label: "Concept art", icon: Lightbulb },
  { id: "social_graphic", label: "Social graphic", icon: Share2 },
  { id: "ad_creative", label: "Ad creative", icon: Target },
  { id: "brand_asset", label: "Brand asset", icon: Gem },
];
const STYLES = ["Modern flat", "Isometric 3D", "Glassmorphism", "Minimal line art", "Bold geometric", "Soft gradient", "Retro poster", "Corporate editorial"];
const RATIOS = ["1:1", "4:5", "16:9", "9:16", "3:2"];
const PRESETS = [
  "Hero banner for an AI content platform launch: glowing document cards flowing into a central spark",
  "Instagram post announcing a 20% off annual plan sale for a SaaS product",
  "Product showcase of a smartwatch with a fitness dashboard on screen",
];

type Img = { id: string; prompt: string; enhanced_prompt: string | null; category: string; style: string; aspect_ratio: string; svg: string; created_at: string; author?: { full_name: string | null } };

const toDataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

function downloadSvg(svg: string, name: string) {
  const a = document.createElement("a");
  a.href = toDataUrl(svg);
  a.download = `${name}.svg`;
  a.click();
}

function downloadPng(svg: string, name: string) {
  const img = new Image();
  img.onload = () => {
    const w = img.naturalWidth || 1080;
    const h = img.naturalHeight || 1080;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    c.getContext("2d")!.drawImage(img, 0, 0, w, h);
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `${name}.png`;
    a.click();
  };
  img.src = toDataUrl(svg);
}

const ratioClass: Record<string, string> = { "1:1": "aspect-square", "4:5": "aspect-[4/5]", "16:9": "aspect-video", "9:16": "aspect-[9/16]", "3:2": "aspect-[3/2]" };

export default function ImagesPage() {
  const [form, setForm] = useState({ prompt: "", category: "marketing_visual", style: "Modern flat", aspectRatio: "1:1", palette: "", headline: "", useBrandVoice: true, model: "" });
  const [current, setCurrent] = useState<Img | null>(null);
  const [open, setOpen] = useState<Img | null>(null);
  const gallery = useApi<{ images: Img[] }>("/api/images");
  const s = useStream();
  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const generate = () => {
    if (!form.prompt.trim()) return toast.error("Describe the image you want");
    setCurrent(null);
    s.start("/api/images/generate", form, (e) => {
      if (e.type === "done") {
        if (e.image) {
          setCurrent(e.image);
          gallery.setData((g) => ({ images: [e.image, ...(g?.images ?? [])] }));
        } else if (e.error) toast.error(e.error);
      }
    });
  };

  const remove = async (img: Img) => {
    try {
      await api(`/api/images/${img.id}`, { method: "DELETE" });
      gallery.setData((g) => ({ images: (g?.images ?? []).filter((i) => i.id !== img.id) }));
      if (current?.id === img.id) setCurrent(null);
      setOpen(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const kb = (s.text.length / 1024).toFixed(1);
  const progress = Math.min(96, Math.round((s.text.length / 14000) * 100));

  return (
    <div>
      <PageHeader
        icon={ImagePlus}
        title="AI Image Studio"
        description="Create on-brand marketing visuals, ad creatives, social graphics and brand assets as crisp, editable vector artwork."
      />

      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Creative brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label="Engine">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-primary/60 bg-primary/5 ring-1 ring-primary/15 p-2.5 text-xs">
                  <div className="font-semibold text-primary">Vector · Claude</div>
                  <div className="text-muted-foreground">Editable SVG creatives</div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="rounded-lg border border-dashed p-2.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 font-semibold">
                        <Lock className="size-3" /> Photoreal
                      </div>
                      <div>Connect a provider</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-60">
                    Plug in an image API (e.g. DALL·E, Flux, Imagen). Each result already includes an enhanced photoreal prompt.
                  </TooltipContent>
                </Tooltip>
              </div>
            </Field>

            <Field label="Asset type">
              <div className="grid grid-cols-3 gap-2">
                {CATS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => set("category", c.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border px-1 py-2.5 text-[11px] font-medium transition-colors cursor-pointer",
                      form.category === c.id ? "border-primary/60 bg-primary/5 ring-1 ring-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <c.icon className="size-4" />
                    {c.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Describe the image">
              <Textarea value={form.prompt} onChange={(e) => set("prompt", e.target.value)} placeholder="A bold hero visual for…" className="min-h-24" />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PRESETS.map((p, i) => (
                  <button key={i} onClick={() => set("prompt", p)} className="rounded-full border px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-foreground cursor-pointer">
                    {p.split(":")[0].slice(0, 34)}…
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Style">
                <Select value={form.style} onValueChange={(v) => set("style", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Palette" hint="optional">
                <Input value={form.palette} onChange={(e) => set("palette", e.target.value)} placeholder="rose, charcoal, cream" />
              </Field>
            </div>

            <Field label="Aspect ratio">
              <div className="flex gap-1 rounded-lg bg-muted p-1">
                {RATIOS.map((r) => (
                  <button
                    key={r}
                    onClick={() => set("aspectRatio", r)}
                    className={cn("flex-1 rounded-md py-1.5 text-xs transition-colors cursor-pointer", form.aspectRatio === r ? "bg-card font-medium text-foreground shadow-xs ring-1 ring-border" : "text-muted-foreground")}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Headline text" hint="optional">
              <Input value={form.headline} onChange={(e) => set("headline", e.target.value)} placeholder="Create more. Coordinate less." />
            </Field>

            <label className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <span>
                <span className="font-medium">Use brand context</span>
                <span className="block text-xs text-muted-foreground">Company name & voice from settings</span>
              </span>
              <Switch checked={form.useBrandVoice} onCheckedChange={(v) => set("useBrandVoice", v)} />
            </label>

            <Field label="Model">
              <ModelSelect value={form.model} onChange={(v) => set("model", v)} />
            </Field>

            {s.streaming ? (
              <Button variant="outline" className="w-full" onClick={s.stop}>
                <Square /> Stop
              </Button>
            ) : (
              <Button className="w-full" size="lg" onClick={generate}>
                <Sparkles /> Generate visual
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="gap-0 overflow-hidden py-0">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <span className="text-sm font-medium">Preview</span>
              {current && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => downloadSvg(current.svg, `contentscale-${current.id.slice(0, 6)}`)}>
                    <Download /> SVG
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadPng(current.svg, `contentscale-${current.id.slice(0, 6)}`)}>
                    <Download /> PNG
                  </Button>
                </div>
              )}
            </div>
            <div className="grid min-h-[480px] place-items-center bg-[radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] [background-size:18px_18px] p-6">
              {s.error && <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{s.error}</div>}
              {!s.streaming && !current && !s.error && (
                <EmptyState icon={ImagePlus} title="No image yet" description="Describe your visual and hit generate. Results are saved to the team gallery." className="border-0 bg-transparent" />
              )}
              {s.streaming && (
                <div className="w-full max-w-sm text-center">
                  <div className={cn("relative mx-auto w-64 overflow-hidden rounded-xl border bg-card", ratioClass[form.aspectRatio])}>
                    <Skeleton className="absolute inset-0 rounded-none" />
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-primary/20 via-transparent to-rose-300/20" />
                  </div>
                  <div className="mt-5 text-sm font-medium">{s.text.includes("<svg") ? "Drawing vector layers…" : "Art-directing the composition…"}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{kb} KB of vector artwork</div>
                  <div className="mx-auto mt-3 h-1.5 w-56 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
              {current && !s.streaming && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={toDataUrl(current.svg)} alt={current.prompt} className="max-h-[560px] w-auto max-w-full rounded-lg shadow-xl" />
              )}
            </div>
            {current?.enhanced_prompt && !s.streaming && (
              <div className="border-t bg-muted/30 px-5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Photoreal prompt (for any image model)</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(current.enhanced_prompt!);
                      toast.success("Prompt copied");
                    }}
                  >
                    <Copy /> Copy
                  </Button>
                </div>
                <p className="mt-1 text-sm">{current.enhanced_prompt}</p>
              </div>
            )}
          </Card>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <Images className="size-4 text-primary" /> Team gallery
              </h2>
              <span className="text-sm text-muted-foreground">{gallery.data?.images.length ?? 0} assets</span>
            </div>
            {gallery.loading ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-xl" />
                ))}
              </div>
            ) : !gallery.data?.images.length ? (
              <EmptyState icon={Images} title="The gallery is empty" description="Generated visuals appear here for the whole team." />
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {gallery.data.images.map((img) => (
                  <button key={img.id} onClick={() => setOpen(img)} className="group overflow-hidden rounded-xl border bg-card text-left transition-shadow hover:shadow-md cursor-pointer">
                    <div className="grid aspect-square place-items-center bg-muted/40 p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={toDataUrl(img.svg)} alt="" className="max-h-full max-w-full rounded" loading="lazy" />
                    </div>
                    <div className="p-2.5">
                      <div className="truncate text-xs font-medium">{img.prompt}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {img.style} · {img.aspect_ratio}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="sm:max-w-3xl">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-6 leading-snug">{open.prompt}</DialogTitle>
                <DialogDescription>
                  {CATS.find((c) => c.id === open.category)?.label} · {open.style} · {open.aspect_ratio} · by {open.author?.full_name ?? "—"} on{" "}
                  {format(new Date(open.created_at), "MMM d, yyyy")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid place-items-center rounded-lg bg-muted/40 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={toDataUrl(open.svg)} alt={open.prompt} className="max-h-[60vh] max-w-full rounded" />
              </div>
              {open.enhanced_prompt && <p className="text-sm text-muted-foreground">{open.enhanced_prompt}</p>}
              <div className="flex flex-wrap justify-end gap-2">
                <Badge variant="soft" className="mr-auto">
                  Vector · SVG
                </Badge>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(open)}>
                  <Trash2 /> Delete
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadSvg(open.svg, `contentscale-${open.id.slice(0, 6)}`)}>
                  <Download /> SVG
                </Button>
                <Button size="sm" onClick={() => downloadPng(open.svg, `contentscale-${open.id.slice(0, 6)}`)}>
                  <Download /> PNG
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
