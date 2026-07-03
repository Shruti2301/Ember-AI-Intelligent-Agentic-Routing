import { useChatStore } from "@/store/useChatStore";

export const FIREWORKS_KEY_HEADER = "x-fireworks-api-key";

// Next.js does not auto-prefix manual fetch() calls with basePath, so we do it
// here. Resolved from next.config.ts (defaults to "/emberai").
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export class ApiKeyMissingError extends Error {
  constructor() {
    super("Add your Fireworks API key in Settings to continue.");
    this.name = "ApiKeyMissingError";
  }
}

export function getStoredApiKey(): string {
  return useChatStore.getState().settings.fireworksApiKey.trim();
}

export function apiHeaders(extra?: HeadersInit): HeadersInit {
  const apiKey = getStoredApiKey();
  if (!apiKey) throw new ApiKeyMissingError();

  return {
    "Content-Type": "application/json",
    [FIREWORKS_KEY_HEADER]: apiKey,
    ...extra,
  };
}

export async function chatFetch(body: unknown): Promise<Response> {
  return fetch(`${BASE_PATH}/api/chat`, {
    method: "POST",
    headers: apiHeaders(),
    body: JSON.stringify(body),
  });
}
