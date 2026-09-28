import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anon);

// Placeholders keep the build working before env vars are set; the login page shows a setup notice.
export const supabase = createClient(url || "http://localhost:54321", anon || "public-anon-key-placeholder", {
  auth: { persistSession: true, autoRefreshToken: true },
});
