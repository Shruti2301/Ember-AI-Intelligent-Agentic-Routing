// Browser-side routing entry point. Order of precedence:
//   1. The user's own Settings rules (regex, evaluated here in the browser)
//   2. The server router — Laya, with keyword fallback (/api/router)
//   3. Local keyword fallback, if the server can't be reached at all

import { routeFetch } from "@/lib/apiClient";
import { matchCustomRule, routeByKeywords } from "@/lib/routing";
import { useChatStore } from "@/store/useChatStore";
import type { RouteDecision } from "@/types";

export async function resolveRoute(prompt: string): Promise<RouteDecision> {
  const custom = matchCustomRule(prompt, useChatStore.getState().settings.routingRules);
  if (custom) return custom;

  try {
    const res = await routeFetch(prompt);
    if (res.ok) return (await res.json()) as RouteDecision;
  } catch {}

  return routeByKeywords(prompt);
}
