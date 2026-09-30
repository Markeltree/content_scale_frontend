"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircle, MailCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AuthHeading, AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name }, emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (data.session) router.replace("/dashboard");
    else setSent(true);
  }

  if (sent) {
    return (
      <AuthShell>
        <div className="mb-6 grid size-11 place-items-center rounded-xl border bg-card text-primary shadow-xs">
          <MailCheck className="size-5" />
        </div>
        <h1 className="text-2xl font-semibold tracking-[-0.025em]">Check your inbox</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          We sent a confirmation link to <span className="font-medium text-foreground">{form.email}</span>. Open it to activate your
          workspace.
        </p>
        <Button asChild variant="outline" size="lg" className="mt-8 w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthHeading title="Create your workspace" description="The first account becomes the workspace admin." />
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Lena Hartmann" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" minLength={8} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" />
        </div>
        <Button type="submit" size="lg" className="mt-2 w-full" disabled={busy}>
          {busy && <LoaderCircle className="animate-spin" />} Create account
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
