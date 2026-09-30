"use client";

import { useCallback, useRef, useState } from "react";
import { supabase } from "./supabase";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://content-scale-backend.vercel.app").replace(/\/$/, "");

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Options = { method?: string; body?: unknown; formData?: FormData; signal?: AbortSignal };

export async function api<T = any>(path: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = { ...(await authHeader()) };
  let body: BodyInit | undefined;
  if (opts.formData) body = opts.formData;
  else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { method: opts.method || (body ? "POST" : "GET"), headers, body, signal: opts.signal });
  } catch {
    throw new ApiError(`Can't reach the API at ${API_URL}. Is the backend running?`, 0);
  }
  const text = await res.text();
  const data = text ? safeJson(text) : {};
  if (!res.ok) throw new ApiError(data?.error || res.statusText || "Request failed", res.status);
  return data as T;
}

function safeJson(t: string) {
  try {
    return JSON.parse(t);
  } catch {
    return { error: t };
  }
}

export type StreamEvent = { type: string;[k: string]: any };

/**
 * POST to an SSE endpoint and call onEvent for each event.
 * If the server responds with plain JSON (e.g. validation error) it's thrown as ApiError.
 */
export async function streamApi(path: string, body: unknown, onEvent: (e: StreamEvent) => void, signal?: AbortSignal) {
  const headers = { "Content-Type": "application/json", ...(await authHeader()) };
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { method: "POST", headers, body: JSON.stringify(body), signal });
  } catch (e: any) {
    if (e?.name === "AbortError") throw e;
    throw new ApiError(`Can't reach the API at ${API_URL}. Is the backend running?`, 0);
  }
  const ctype = res.headers.get("content-type") || "";
  if (!res.ok || !ctype.includes("text/event-stream")) {
    const data = safeJson(await res.text());
    throw new ApiError(data?.error || "Request failed", res.status);
  }
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let last: StreamEvent | null = null;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const line = raw.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;
      const evt = safeJson(line.slice(5).trim()) as StreamEvent;
      if (evt.type === "error") throw new ApiError(evt.message || "Generation failed", 500);
      last = evt;
      onEvent(evt);
    }
  }
  return last;
}

/** React hook for streaming text generation. */
export function useStream() {
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<StreamEvent | null>(null);
  const [done, setDone] = useState<StreamEvent | null>(null);
  const ctrl = useRef<AbortController | null>(null);

  const start = useCallback(async (path: string, body: unknown, onEvent?: (e: StreamEvent) => void) => {
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    setText("");
    setError(null);
    setMeta(null);
    setDone(null);
    setStreaming(true);
    try {
      await streamApi(
        path,
        body,
        (e) => {
          if (e.type === "text") setText((t) => t + e.text);
          else if (e.type === "meta") setMeta(e);
          else if (e.type === "done") setDone(e);
          onEvent?.(e);
        },
        c.signal
      );
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e.message || "Something went wrong");
    } finally {
      setStreaming(false);
    }
  }, []);

  const stop = useCallback(() => {
    ctrl.current?.abort();
    setStreaming(false);
  }, []);

  const reset = useCallback(() => {
    setText("");
    setError(null);
    setMeta(null);
    setDone(null);
  }, []);

  return { text, setText, streaming, error, meta, done, start, stop, reset };
}
