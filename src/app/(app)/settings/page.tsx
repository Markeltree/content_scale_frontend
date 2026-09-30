"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Settings, User, Megaphone, Palette, Plug, CircleCheck, CircleAlert, Sun, Moon, Monitor } from "lucide-react";
import { api, API_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, PageHeader, UserAvatar } from "@/components/shared";

type Brand = { company: string; voice: string; audience: string; do: string[]; dont: string[]; keywords: string[] };

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState({ full_name: "", job_title: "" });
  const [brand, setBrand] = useState<Brand | null>(null);
  const [health, setHealth] = useState<{ status: string; supabase: boolean; anthropic: boolean } | null>(null);
  const [healthErr, setHealthErr] = useState(false);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (user) setProfile({ full_name: user.full_name ?? "", job_title: user.job_title ?? "" });
  }, [user]);

  useEffect(() => {
    api<{ brand: Partial<Brand> }>("/api/settings/brand")
      .then((r) => setBrand({ company: "", voice: "", audience: "", do: [], dont: [], keywords: [], ...r.brand }))
      .catch(() => {});
    fetch(`${API_URL}/api/health`)
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealthErr(true));
  }, []);

  const saveProfile = async () => {
    try {
      await api("/api/me", { method: "PATCH", body: profile });
      await refresh();
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const saveBrand = async () => {
    try {
      await api("/api/settings/brand", { method: "PUT", body: { brand } });
      toast.success("Brand voice saved — all new generations will use it");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const lines = (a: string[]) => a.join("\n");
  const split = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

  return (
    <div>
      <PageHeader icon={Settings} title="Settings" description="Manage your profile, the workspace brand voice and appearance." />
      <Tabs defaultValue="brand">
        <TabsList className="mb-2">
          <TabsTrigger value="brand">
            <Megaphone /> Brand voice
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User /> Profile
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette /> Appearance
          </TabsTrigger>
          <TabsTrigger value="system">
            <Plug /> System status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brand">
          <Card>
            <CardHeader>
              <CardTitle>Brand voice</CardTitle>
              <CardDescription>Injected into content generation, the writing assistant and knowledge answers. {!isAdmin && "Only admins can edit."}</CardDescription>
            </CardHeader>
            {brand && (
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Company name">
                    <Input value={brand.company} disabled={!isAdmin} onChange={(e) => setBrand({ ...brand, company: e.target.value })} />
                  </Field>
                  <Field label="Primary audience">
                    <Input value={brand.audience} disabled={!isAdmin} onChange={(e) => setBrand({ ...brand, audience: e.target.value })} />
                  </Field>
                </div>
                <Field label="Voice description">
                  <Textarea value={brand.voice} disabled={!isAdmin} onChange={(e) => setBrand({ ...brand, voice: e.target.value })} className="min-h-20" />
                </Field>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Do" hint="one per line">
                    <Textarea value={lines(brand.do)} disabled={!isAdmin} onChange={(e) => setBrand({ ...brand, do: split(e.target.value) })} className="min-h-28" />
                  </Field>
                  <Field label="Don't" hint="one per line">
                    <Textarea value={lines(brand.dont)} disabled={!isAdmin} onChange={(e) => setBrand({ ...brand, dont: split(e.target.value) })} className="min-h-28" />
                  </Field>
                  <Field label="Keywords" hint="one per line">
                    <Textarea value={lines(brand.keywords)} disabled={!isAdmin} onChange={(e) => setBrand({ ...brand, keywords: split(e.target.value) })} className="min-h-28" />
                  </Field>
                </div>
                {isAdmin && <Button onClick={saveBrand}>Save brand voice</Button>}
              </CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Your profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <UserAvatar name={user?.full_name || user?.email} src={user?.avatar_url} className="size-14 text-base" />
                <div>
                  <div className="font-medium">{user?.email}</div>
                  <Badge variant="soft" className="mt-1 capitalize">
                    {user?.role}
                  </Badge>
                </div>
              </div>
              <Field label="Full name">
                <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
              </Field>
              <Field label="Job title">
                <Input value={profile.job_title} onChange={(e) => setProfile({ ...profile, job_title: e.target.value })} placeholder="Content Lead" />
              </Field>
              <Button onClick={saveProfile}>Save profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Theme</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
              {[
                { v: "light", label: "Light", icon: Sun },
                { v: "dark", label: "Dark", icon: Moon },
                { v: "system", label: "System", icon: Monitor },
              ].map((o) => (
                <button
                  key={o.v}
                  onClick={() => setTheme(o.v)}
                  className={cn("flex flex-col items-center gap-2 rounded-xl border p-4 text-sm cursor-pointer", theme === o.v ? "border-primary/60 bg-primary/5 ring-1 ring-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}
                >
                  <o.icon className="size-5" />
                  {o.label}
                </button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>System status</CardTitle>
              <CardDescription className="font-mono text-xs">{API_URL}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Backend API (Express on Vercel)", ok: !!health && !healthErr },
                { label: "Supabase (database & auth)", ok: !!health?.supabase },
                { label: "Anthropic API key", ok: !!health?.anthropic },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <span>{r.label}</span>
                  {r.ok ? (
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <CircleCheck className="size-4" /> Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-rose-600">
                      <CircleAlert className="size-4" /> {health || healthErr ? "Not configured" : "Checking…"}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
