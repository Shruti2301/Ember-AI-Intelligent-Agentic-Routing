// Routing logic that is safe to run in both the browser and the server:
// category → model mapping, the regex/keyword fallback, and custom-rule
// matching. The Laya classifier lives server-side in services/laya.ts.

import { FIREWORKS_MODELS, ROUTING_KEYWORDS } from "@/lib/models";
import { DEFAULT_ROUTING_RULES } from "@/lib/rules";
import type { RouteCategory, RouteDecision, RouterRule } from "@/types";

export const DEFAULT_MODEL = "accounts/fireworks/models/deepseek-v4p1-flash";

export const ROUTE_CATEGORIES: Record<
  RouteCategory,
  { label: string; model: string; description: string }
> = {
  coding: {
    label: "Coding & Technical",
    model: "accounts/fireworks/models/kimi-k2p7-code",
    description: "writing, reviewing, debugging or explaining source code, programming, software or APIs",
  },
  reasoning: {
    label: "Math & Reasoning",
    model: "accounts/fireworks/models/deepseek-v4-pro-0813",
    description: "math problems, calculations, logic puzzles, proofs, probability or step-by-step analysis",
  },
  creative: {
    label: "Creative Writing",
    model: "accounts/fireworks/models/glm-5p3",
    description: "stories, poems, essays, blog posts, marketing copy or other original creative writing",
  },
  translation: {
    label: "Translation",
    model: DEFAULT_MODEL,
    description: "translating text from one language into another",
  },
  summarization: {
    label: "Summarization",
    model: DEFAULT_MODEL,
    description: "summarizing, condensing or extracting key points from a provided text",
  },
  general: {
    label: "General Q&A",
    model: DEFAULT_MODEL,
    description: "everyday questions, facts, advice, chit-chat and anything else",
  },
};

const SPEED: Record<string, RouteDecision["expectedSpeed"]> = {
  "accounts/fireworks/models/deepseek-v4p1-flash": "fast",
  "accounts/fireworks/models/glm-5p3-flash": "fast",
  "accounts/fireworks/models/gpt-oss-120b": "fast",
  "accounts/fireworks/models/glm-5p3": "moderate",
  "accounts/fireworks/models/kimi-k2p7-code": "moderate",
  "accounts/fireworks/routers/glm-latest": "moderate",
  "accounts/fireworks/models/deepseek-v4-pro-0813": "slow",
  "accounts/fireworks/models/kimi-k3": "slow",
};

export function buildDecision(
  modelId: string,
  reason: string,
  extra: Pick<RouteDecision, "source" | "category" | "confidence">
): RouteDecision {
  const model = FIREWORKS_MODELS.find((m) => m.id === modelId);
  const avgTokens = 500;
  const estimatedCost = model
    ? (model.inputPrice * avgTokens) / 1_000_000 + (model.outputPrice * avgTokens) / 1_000_000
    : 0.001;

  return {
    model: modelId,
    reason,
    estimatedCost,
    expectedSpeed: SPEED[modelId] || "moderate",
    ...extra,
  };
}

export function decisionForCategory(
  category: RouteCategory,
  reason: string,
  source: RouteDecision["source"],
  confidence?: number
): RouteDecision {
  return buildDecision(ROUTE_CATEGORIES[category].model, reason, { source, category, confidence });
}

// Rules the user added or edited in Settings. Untouched defaults don't count:
// those are the regex fallback, and letting them win would bypass Laya.
export function customRules(rules: RouterRule[]): RouterRule[] {
  return rules.filter((r) => {
    if (!r.enabled || r.pattern === ".*") return false;
    const d = DEFAULT_ROUTING_RULES.find((x) => x.id === r.id);
    return !d || d.pattern !== r.pattern || d.model !== r.model;
  });
}

// Runs user-supplied regex, so only call this in the browser — never on the
// server, where a catastrophic-backtracking pattern could stall every request.
export function matchCustomRule(prompt: string, rules: RouterRule[]): RouteDecision | null {
  for (const rule of customRules(rules)) {
    try {
      if (new RegExp(rule.pattern, "i").test(prompt)) {
        return buildDecision(rule.model, `Matched your rule: ${rule.name}`, { source: "rule" });
      }
    } catch {}
  }
  return null;
}

const DEFAULT_RULE_CATEGORY: Record<string, RouteCategory> = {
  "rule-1": "coding",
  "rule-2": "reasoning",
  "rule-3": "creative",
  "rule-4": "translation",
  "rule-5": "summarization",
};

// The original regex router, kept as the fallback for when Laya is
// unavailable, slow, or unsure. Uses only the built-in patterns.
export function routeByKeywords(prompt: string): RouteDecision {
  const lower = prompt.toLowerCase();

  for (const rule of DEFAULT_ROUTING_RULES) {
    const category = DEFAULT_RULE_CATEGORY[rule.id];
    if (category && new RegExp(rule.pattern, "i").test(lower)) {
      return decisionForCategory(category, `Keyword match: ${rule.name}`, "regex");
    }
  }

  for (const [category, keywords] of Object.entries(ROUTING_KEYWORDS)) {
    const kw = keywords.find((k) => lower.includes(k));
    if (kw) {
      const c = category as RouteCategory;
      return decisionForCategory(c, `Keyword match: ${ROUTE_CATEGORIES[c].label} ("${kw}")`, "regex");
    }
  }

  return decisionForCategory("general", "Default route — general Q&A", "default");
}
