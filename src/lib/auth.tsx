"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { api } from "./api";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "admin" | "editor" | "viewer";
  status: string;
  job_title: string | null;
};

type AuthState = {
  session: Session | null;
  user: Profile | null;
  loading: boolean;
  apiError: string | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadProfile = useCallback(async (s: Session | null) => {
    if (!s) {
      setUser(null);
      return;
    }
    try {
      const { user } = await api<{ user: Profile }>("/api/me");
      setUser(user);
      setApiError(null);
    } catch (e: any) {
      setApiError(e.message);
      // Fall back to session info so the UI still renders.
      setUser({
        id: s.user.id,
        email: s.user.email ?? "",
        full_name: (s.user.user_metadata?.full_name as string) ?? null,
        avatar_url: null,
        role: "editor",
        status: "active",
        job_title: null,
      });
    }
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadProfile(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") loadProfile(s);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value: AuthState = {
    session,
    user,
    loading,
    apiError,
    refresh: () => loadProfile(session),
    signOut: async () => {
      await supabase.auth.signOut();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
