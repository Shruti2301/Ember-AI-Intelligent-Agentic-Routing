import type { ModelInfo } from "@/types";

export const FIREWORKS_MODELS: ModelInfo[] = [
  {
    id: "accounts/fireworks/models/deepseek-v4-flash",
    name: "DeepSeek V4 Flash",
    provider: "Fireworks",
    category: "fast",
    inputPrice: 0.14,
    outputPrice: 0.28,
    cachingSupported: true,
    contextWindow: 128000,
    strengths: ["Speed", "Simple Q&A", "Translation", "Summarization"],
  },
  {
    id: "accounts/fireworks/models/glm-5p1",
    name: "GLM 5.1",
    provider: "Fireworks",
    category: "instruct",
    inputPrice: 1.4,
    outputPrice: 4.4,
    cachingSupported: true,
    contextWindow: 128000,
    strengths: ["Creative writing", "General tasks", "Instruction following"],
  },
  {
    id: "accounts/fireworks/models/glm-5p2",
    name: "GLM 5.2",
    provider: "Fireworks",
    category: "coding",
    inputPrice: 1.4,
    outputPrice: 4.4,
    cachingSupported: true,
    contextWindow: 128000,
    strengths: ["Coding", "Technical tasks", "Complex reasoning"],
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
    id: "accounts/fireworks/models/glm-fast-latest",
    name: "GLM Fast Latest",
    provider: "Fireworks",
    category: "fast",
    inputPrice: 2.1,
    outputPrice: 6.6,
    cachingSupported: true,
    contextWindow: 128000,
    strengths: ["Speed", "Low latency", "Agentic workflows"],
  },
  {
    id: "accounts/fireworks/models/deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    provider: "Fireworks",
    category: "reasoning",
    inputPrice: 1.74,
    outputPrice: 3.48,
    cachingSupported: true,
    contextWindow: 128000,
    strengths: ["Math", "Reasoning", "Complex problem solving"],
  },
  {
    id: "accounts/fireworks/models/kimi-k2p5",
    name: "Kimi K2.5",
    provider: "Fireworks",
    category: "reasoning",
    inputPrice: 0.6,
    outputPrice: 3.0,
    cachingSupported: true,
    contextWindow: 128000,
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
    contextWindow: 32768,
    strengths: ["Open-weight", "General tasks", "Cost-effective"],
  },
];

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
  return process.env.NEXT_PUBLIC_DEFAULT_MODEL || "accounts/fireworks/models/glm-5p1";
}
