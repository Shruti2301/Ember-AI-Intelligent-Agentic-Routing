// Server-side router: ask Laya first, fall back to keyword matching when it
// is unconfigured, unreachable, slow, or not confident. Custom Settings rules
// are applied in the browser before this is called (see lib/routeClient.ts).

import { classifyWithLaya } from "@/services/laya";
import { ROUTE_CATEGORIES, decisionForCategory, routeByKeywords } from "@/lib/routing";
import type { RouteDecision } from "@/types";

const MIN_CONFIDENCE = Number(process.env.LAYA_MIN_CONFIDENCE) || 0.5;

export async function routePrompt(prompt: string): Promise<RouteDecision> {
  const laya = await classifyWithLaya(prompt);

  if (laya && laya.confidence >= MIN_CONFIDENCE) {
    const pct = Math.round(laya.confidence * 100);
    return decisionForCategory(
      laya.category,
      `Laya: ${ROUTE_CATEGORIES[laya.category].label} (${pct}% confident, ${laya.latencyMs}ms)`,
      "laya",
      laya.confidence
    );
  }

  const fallback = routeByKeywords(prompt);
  if (laya) {
    const pct = Math.round(laya.confidence * 100);
    fallback.reason += ` — Laya unsure (${ROUTE_CATEGORIES[laya.category].label}, ${pct}%)`;
  }
  return fallback;
}
