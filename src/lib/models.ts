import type { ModelInfo } from "@/types";

// Model IDs verified against Fireworks' serverless catalogue on 2026-09-25.
// Fireworks retires and renames models; when one 404s ("Model not found"),
// update it here and add the old ID to RETIRED_MODELS below.
export const FIREWORKS_MODELS: ModelInfo[] = [
  {
    id: "accounts/fireworks/models/deepseek-v4p1-flash",
    name: "DeepSeek V4.1 Flash",
    provider: "Fireworks",
    category: "fast",
    inputPrice: 0.22,
    outputPrice: 0.66,
    cachingSupported: true,
    contextWindow: 1048576,
    strengths: ["Speed", "Simple Q&A", "Translation", "Summarization"],
  },
  {
    id: "accounts/fireworks/models/glm-5p3-flash",
    name: "GLM 5.3 Flash",
    provider: "Fireworks",
    category: "fast",
    inputPrice: 0.15,
    outputPrice: 0.5,
    cachingSupported: true,
    contextWindow: 1048576,
    strengths: ["Speed", "Low cost", "General tasks"],
  },
  {
    id: "accounts/fireworks/models/glm-5p3",
    name: "GLM 5.3",
    provider: "Fireworks",
    category: "instruct",
    inputPrice: 1.4,
    outputPrice: 4.4,
    cachingSupported: true,
    contextWindow: 1048576,
    strengths: ["Creative writing", "General tasks", "Instruction following"],
  },
  {
    id: "accounts/fireworks/routers/glm-latest",
    name: "GLM Latest Router",
    provider: "Fireworks",
    category: "instruct",
    inputPrice: 1.4,
    outputPrice: 4.4,
    cachingSupported: true,
    contextWindow: 128000,
    strengths: ["Agentic tasks", "All-around", "Latest capabilities"],
  },
  {
    id: "accounts/fireworks/models/kimi-k2p7-code",
    name: "Kimi K2.7 Code",
    provider: "Fireworks",
    category: "coding",
    inputPrice: 0.95,
    outputPrice: 4.0,
    cachingSupported: true,
    contextWindow: 262144,
    strengths: ["Coding", "Debugging", "Technical tasks"],
  },
  {
    id: "accounts/fireworks/models/deepseek-v4-pro-0813",
    name: "DeepSeek V4 Pro",
    provider: "Fireworks",
    category: "reasoning",
    inputPrice: 1.32,
    outputPrice: 3.96,
    cachingSupported: true,
    contextWindow: 1048576,
    strengths: ["Math", "Reasoning", "Complex problem solving"],
  },
  {
    id: "accounts/fireworks/models/kimi-k3",
    name: "Kimi K3",
    provider: "Fireworks",
    category: "reasoning",
    inputPrice: 3.0,
    outputPrice: 15.0,
    cachingSupported: true,
    contextWindow: 1048576,
    strengths: ["Long reasoning", "Analysis", "Research"],
  },
  {
    id: "accounts/fireworks/models/gpt-oss-120b",
    name: "GPT-OSS 120B",
    provider: "Fireworks",
    category: "instruct",
    inputPrice: 0.15,
    outputPrice: 0.6,
    cachingSupported: true,
    contextWindow: 131072,
    strengths: ["Open-weight", "General tasks", "Cost-effective"],
  },
];

// Retired Fireworks IDs → their replacements. Used to migrate routing rules
// already saved in visitors' browsers, which would otherwise keep pointing
// at models that now 404.
export const RETIRED_MODELS: Record<string, string> = {
  "accounts/fireworks/models/deepseek-v4-flash": "accounts/fireworks/models/deepseek-v4p1-flash",
  "accounts/fireworks/models/deepseek-v4-pro": "accounts/fireworks/models/deepseek-v4-pro-0813",
  "accounts/fireworks/models/glm-5p1": "accounts/fireworks/models/glm-5p3",
  "accounts/fireworks/models/glm-5p2": "accounts/fireworks/models/kimi-k2p7-code",
  "accounts/fireworks/models/glm-fast-latest": "accounts/fireworks/models/glm-5p3-flash",
  "accounts/fireworks/models/kimi-k2p5": "accounts/fireworks/models/kimi-k3",
};

export const ROUTING_KEYWORDS: Record<string, string[]> = {
  coding: [
    "code", "function", "bug", "debug", "typescript", "javascript",
    "python", "react", "api", "sql", "algorithm", "refactor",
    "implement", "class", "component", "hook", "async", "promise",
    "callback", "variable", "array", "object", "import", "export",
  ],
  reasoning: [
    "explain why", "reason", "logic", "proof", "theorem", "equation",
    "solve", "calculate", "math", "probability", "analysis", "compare",
    "contrast", "evaluate", "deduce", "inference", "hypothesis",
  ],
  creative: [
    "write a story", "poem", "creative", "essay", "blog post",
    "article", "content", "marketing", "ad copy", "description",
    "narrative", "dialogue", "script", "draft", "compose",
  ],
  translation: [
    "translate", "translation", "convert to", "in spanish", "in french",
    "in german", "in chinese", "in japanese", "in korean",
  ],
  summarization: [
    "summarize", "summary", "tl;dr", "key points", "main ideas",
    "in short", "condense", "brief", "overview", "recap",
  ],
};

export function getDefaultModel(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_MODEL || "accounts/fireworks/models/deepseek-v4p1-flash";
}
