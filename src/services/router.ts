import { ROUTING_KEYWORDS, FIREWORKS_MODELS } from "@/lib/models";
import { DEFAULT_ROUTING_RULES } from "@/lib/rules";
import type { RouteDecision, RouterRule } from "@/types";

function getEnabledRules(): RouterRule[] {
  if (typeof window === "undefined") return DEFAULT_ROUTING_RULES;
  try {
    const stored = localStorage.getItem("ember-routing-rules");
    if (stored) {
      const parsed = JSON.parse(stored) as RouterRule[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_ROUTING_RULES;
}

export function routePrompt(prompt: string): RouteDecision {
  const lower = prompt.toLowerCase();
  const rules = getEnabledRules().filter((r) => r.enabled);

  // Try user-defined rules first (non-catch-all)
  for (const rule of rules) {
    if (rule.pattern === ".*") continue; // skip catch-all
    try {
      const regex = new RegExp(rule.pattern, "i");
      if (regex.test(lower)) {
        return buildDecision(rule.model, `Matched rule: ${rule.name}`);
      }
    } catch {}
  }

  // Heuristic fallback
  for (const [category, keywords] of Object.entries(ROUTING_KEYWORDS)) {
    const matched = keywords.some((kw) => lower.includes(kw));
    if (matched) {
      const modelMap: Record<string, string> = {
        coding: "accounts/fireworks/models/glm-5p2",
        reasoning: "accounts/fireworks/models/deepseek-v4-pro",
        creative: "accounts/fireworks/models/glm-5p1",
        translation: "accounts/fireworks/models/deepseek-v4-flash",
        summarization: "accounts/fireworks/models/deepseek-v4-flash",
      };
      const modelId = modelMap[category];
      const categoryLabels: Record<string, string> = {
        coding: "Coding & Technical",
        reasoning: "Math & Reasoning",
        creative: "Creative Writing",
        translation: "Translation",
        summarization: "Summarization",
      };
      return buildDecision(
        modelId,
        `Detected: ${categoryLabels[category]} — ${matched} keyword match`
      );
    }
  }

  // Default (catch-all rule)
  const catchAll = rules.find((r) => r.pattern === ".*");
  return buildDecision(
    catchAll?.model || "accounts/fireworks/models/deepseek-v4-flash",
    "Default route — general Q&A"
  );
}

function buildDecision(modelId: string, reason: string): RouteDecision {
  const model = FIREWORKS_MODELS.find((m) => m.id === modelId);
  const avgTokens = 500;
  const estimatedCost =
    model && reason !== "Default route — general Q&A"
      ? (model.inputPrice * avgTokens) / 1_000_000 +
        (model.outputPrice * avgTokens) / 1_000_000
      : 0.001;

  const speedMap: Record<string, "fast" | "moderate" | "slow"> = {
    "accounts/fireworks/models/deepseek-v4-flash": "fast",
    "accounts/fireworks/models/glm-fast-latest": "fast",
    "accounts/fireworks/models/gpt-oss-120b": "fast",
    "accounts/fireworks/models/glm-5p1": "moderate",
    "accounts/fireworks/models/glm-5p2": "moderate",
    "accounts/fireworks/routers/glm-latest": "moderate",
    "accounts/fireworks/models/deepseek-v4-pro": "slow",
    "accounts/fireworks/models/kimi-k2p5": "slow",
  };

  return {
    model: modelId,
    reason,
    estimatedCost,
    expectedSpeed: speedMap[modelId] || "moderate",
  };
}
