"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CircleAlert, LoaderCircle, Sparkles } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { AuthHeading, AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL || "";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "";

export default function LoginPage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) router.replace("/dashboard");
  }, [loading, session, router]);

  async function signIn(e?: React.FormEvent, creds?: { email: string; password: string }) {
    e?.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(creds ?? { email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    router.replace("/dashboard");
  }

  return (
    <AuthShell>
      <AuthHeading title="Welcome back" description="Sign in to your ContentScale workspace." />

      {!supabaseConfigured && (
        <div className="mt-6 flex gap-2 rounded-lg border border-amber-500/25 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          <CircleAlert className="size-4 shrink-0" />
          Supabase isn&apos;t configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
        </div>
      )}

      {DEMO_EMAIL && DEMO_PASSWORD && (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="mt-8 w-full"
          disabled={busy}
          onClick={() => signIn(undefined, { email: DEMO_EMAIL, password: DEMO_PASSWORD })}
        >
          <Sparkles className="text-primary" /> Explore the live demo
        </Button>
      )}
      {DEMO_EMAIL && DEMO_PASSWORD && (
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or sign in with email
          <span className="h-px flex-1 bg-border" />
        </div>
      )}

      <form onSubmit={signIn} className={DEMO_EMAIL && DEMO_PASSWORD ? "space-y-4" : "mt-8 space-y-4"}>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" size="lg" className="mt-2 w-full" disabled={busy}>
          {busy && <LoaderCircle className="animate-spin" />} Sign in
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        New to ContentScale?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
