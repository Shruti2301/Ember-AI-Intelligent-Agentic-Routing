import { useChatStore } from "@/store/useChatStore";

export const FIREWORKS_KEY_HEADER = "x-fireworks-api-key";

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
  return fetch("/api/chat", {
    method: "POST",
    headers: apiHeaders(),
    body: JSON.stringify(body),
  });
}
