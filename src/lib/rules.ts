import type { RouterRule } from "@/types";

export const DEFAULT_ROUTING_RULES: RouterRule[] = [
  { id: "rule-1", name: "Coding & Technical", pattern: "code|function|bug|debug|api|react|typescript|python|sql|refactor|implement|algorithm", model: "accounts/fireworks/models/kimi-k2p7-code", enabled: true },
  { id: "rule-2", name: "Math & Reasoning", pattern: "math|equation|calculate|solve|reason|logic|proof|probability|analysis|deduce", model: "accounts/fireworks/models/deepseek-v4-pro-0813", enabled: true },
  { id: "rule-3", name: "Creative Writing", pattern: "write a story|poem|creative|essay|blog|article|marketing|narrative|compose", model: "accounts/fireworks/models/glm-5p3", enabled: true },
  { id: "rule-4", name: "Translation", pattern: "translate|translation|in spanish|in french|in german|in chinese", model: "accounts/fireworks/models/deepseek-v4p1-flash", enabled: true },
  { id: "rule-5", name: "Summarization", pattern: "summarize|summary|tl;dr|key points|main ideas|condense|brief|recap", model: "accounts/fireworks/models/deepseek-v4p1-flash", enabled: true },
  { id: "rule-6", name: "General Q&A", pattern: ".*", model: "accounts/fireworks/models/deepseek-v4p1-flash", enabled: true },
];
