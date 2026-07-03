import { NextRequest, NextResponse } from "next/server";
import { complete } from "@/services/fireworks";
import { routePrompt } from "@/services/router";
import { getRequestApiKey, missingApiKeyResponse } from "@/lib/apiKey";
import { validateChatBody } from "@/lib/validateChat";

export async function POST(req: NextRequest) {
  try {
    const apiKey = getRequestApiKey(req);
    if (!apiKey) return missingApiKeyResponse();

    const parsed = validateChatBody(await req.json());
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { messages, model, temperature, maxTokens } = parsed.value;

    const lastMessage = messages[messages.length - 1]?.content || "";
    const route = routePrompt(lastMessage);

    const selectedModel = model || route.model;

    const result = await complete({
      model: selectedModel,
      messages,
      temperature,
      maxTokens,
      apiKey,
    });

    return NextResponse.json({
      content: result.content,
      model: selectedModel,
      tokens: result.tokens,
      latency: result.latency,
      cost: result.cost,
      cacheEstimate: result.cacheEstimate,
      routeReason: route.reason,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
