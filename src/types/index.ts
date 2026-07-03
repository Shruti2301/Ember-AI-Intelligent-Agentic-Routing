export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  model?: string;
  latency?: number;
  tokens?: TokenUsage;
  cost?: number;
  cacheEstimate?: CacheEstimate;
  status?: "streaming" | "complete" | "error";
}

export interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

export interface CacheEstimate {
  percentage: number;
  tokensSaved: number;
  latencyImprovement: number;
}

export interface RouteDecision {
  model: string;
  reason: string;
  estimatedCost: number;
  expectedSpeed: "fast" | "moderate" | "slow";
  userOverridden?: boolean;
  originalModel?: string;
}

export interface TelemetryEntry {
  id: string;
  timestamp: Date;
  prompt: string;
  response: string;
  model: string;
  latency: number;
  tokens: TokenUsage;
  estimatedCost: number;
  cacheEstimate: CacheEstimate;
  status: "success" | "error";
  routeReason?: string;
}

export interface AgentLoopStep {
  id: string;
  phase: "plan" | "generate" | "review" | "improve" | "final";
  label: string;
  content: string;
  model: string;
  duration: number;
  tokens: TokenUsage;
  status: "pending" | "running" | "complete" | "error";
}

export interface AgentLoop {
  id: string;
  prompt: string;
  steps: AgentLoopStep[];
  startedAt: Date;
  completedAt?: Date;
  status: "running" | "complete" | "error";
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  category: "fast" | "reasoning" | "instruct" | "coding";
  inputPrice: number;
  outputPrice: number;
  cachingSupported: boolean;
  contextWindow: number;
  strengths: string[];
}

export interface ComparisonResult {
  modelId: string;
  response: string;
  latency: number;
  tokens: TokenUsage;
  cost: number;
  quality?: number;
}

export interface RouterRule {
  id: string;
  name: string;
  pattern: string;
  model: string;
  enabled: boolean;
}

export interface AppSettings {
  fireworksApiKey: string;
  temperature: number;
  maxTokens: number;
  darkMode: boolean;
  routingRules: RouterRule[];
}
