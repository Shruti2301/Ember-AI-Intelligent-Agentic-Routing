export const FIREWORKS_KEY_HEADER = "x-fireworks-api-key";

/**
 * Whether the server is allowed to fall back to its own FIREWORKS_API_KEY when a
 * request arrives without a BYOK header.
 *
 * BYOK safety: in production this is OFF unless you explicitly opt in with
 * ALLOW_SHARED_KEY=true. That prevents an accidental prod deploy (with a key in
 * the environment) from letting anonymous visitors spend your key. In local dev
 * the fallback stays on for convenience.
 */
export function sharedKeyAllowed(): boolean {
  if (process.env.ALLOW_SHARED_KEY === "true") return true;
  return process.env.NODE_ENV !== "production";
}

export function getRequestApiKey(req: Request): string | null {
  const headerKey = req.headers.get(FIREWORKS_KEY_HEADER)?.trim();
  if (headerKey) return headerKey;

  if (sharedKeyAllowed()) {
    const envKey = process.env.FIREWORKS_API_KEY?.trim();
    if (envKey) return envKey;
  }

  return null;
}

export function missingApiKeyResponse() {
  return Response.json(
    {
      error:
        "Fireworks API key required. Get a free key at fireworks.ai and add it in Settings.",
    },
    { status: 401 }
  );
}
