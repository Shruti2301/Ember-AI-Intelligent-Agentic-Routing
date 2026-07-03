// Hard limits to bound cost and abuse on the /api/chat* routes. These apply
// regardless of who owns the key — a runaway client (or a shared-key deploy)
// can't ask for unbounded generation or ship an unbounded prompt.
export const CHAT_LIMITS = {
  maxMessages: 50,
  maxTotalChars: 100_000, // ~25k tokens of prompt
  maxTokensCeil: 8192,
  temperatureMin: 0,
  temperatureMax: 2,
};

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ValidatedChatBody {
  messages: ChatMessage[];
  model?: string;
  temperature: number;
  maxTokens: number;
}

export type ValidationResult =
  | { ok: true; value: ValidatedChatBody }
  | { ok: false; error: string };

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function validateChatBody(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid request body" };
  }
  const b = body as Record<string, unknown>;

  const messages = b.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, error: "Messages are required" };
  }
  if (messages.length > CHAT_LIMITS.maxMessages) {
    return { ok: false, error: `Too many messages (max ${CHAT_LIMITS.maxMessages})` };
  }

  let totalChars = 0;
  const clean: ChatMessage[] = [];
  for (const m of messages) {
    if (typeof m !== "object" || m === null) {
      return { ok: false, error: "Each message must be an object" };
    }
    const role = (m as Record<string, unknown>).role;
    const content = (m as Record<string, unknown>).content;
    if (typeof role !== "string" || typeof content !== "string") {
      return { ok: false, error: "Each message needs a string role and content" };
    }
    totalChars += content.length;
    if (totalChars > CHAT_LIMITS.maxTotalChars) {
      return { ok: false, error: "Prompt too large" };
    }
    clean.push({ role, content });
  }

  const model = typeof b.model === "string" && b.model.trim() ? b.model : undefined;

  const rawTemp = typeof b.temperature === "number" && Number.isFinite(b.temperature) ? b.temperature : 0.7;
  const temperature = clamp(rawTemp, CHAT_LIMITS.temperatureMin, CHAT_LIMITS.temperatureMax);

  const rawMax = typeof b.maxTokens === "number" && Number.isFinite(b.maxTokens) ? Math.floor(b.maxTokens) : 2048;
  const maxTokens = clamp(rawMax, 1, CHAT_LIMITS.maxTokensCeil);

  return { ok: true, value: { messages: clean, model, temperature, maxTokens } };
}
