// Server-only client for the Laya classifier (https://github.com/NandhaKishorM/laya).
// Laya runs as a separate container; see laya/Dockerfile and docker-compose.yml.
// Every failure mode returns null so the caller falls back to keyword routing.

import { ROUTE_CATEGORIES } from "@/lib/routing";
import type { RouteCategory } from "@/types";

const LAYA_URL = process.env.LAYA_URL?.replace(/\/$/, "");
const TIMEOUT_MS = Number(process.env.LAYA_TIMEOUT_MS) || 1500;
// Laya's context is 512 tokens on the English checkpoint; the start of a
// prompt carries the intent, so don't ship the whole thing.
const MAX_CHARS = 2000;

export interface LayaResult {
  category: RouteCategory;
  confidence: number;
  latencyMs: number;
}

const criteria = Object.fromEntries(
  Object.entries(ROUTE_CATEGORIES).map(([k, v]) => [k, v.description])
);

export function layaEnabled(): boolean {
  return Boolean(LAYA_URL);
}

export async function classifyWithLaya(prompt: string): Promise<LayaResult | null> {
  if (!LAYA_URL) return null;
  const started = Date.now();

  try {
    const res = await fetch(`${LAYA_URL}/v1/systemone`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.LAYA_API_KEY && { Authorization: `Bearer ${process.env.LAYA_API_KEY}` }),
      },
      body: JSON.stringify({
        // English checkpoint only; the image ships no other weights.
        model: "english",
        state: { body: prompt.slice(0, MAX_CHARS) },
        questions: {
          route: {
            type: "choice",
            instructions: "What kind of task is the user asking an AI assistant to do?",
            criteria,
          },
        },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) return null;

    const data = await res.json();
    const answer = data?.answers?.route;
    const category = answer?.choice as RouteCategory | undefined;
    if (!category || !(category in ROUTE_CATEGORIES)) return null;

    return {
      category,
      confidence: typeof answer.confidence === "number" ? answer.confidence : 0,
      latencyMs: Date.now() - started,
    };
  } catch {
    return null;
  }
}
