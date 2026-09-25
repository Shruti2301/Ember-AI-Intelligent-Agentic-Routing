import { NextRequest } from "next/server";
import { completeStream } from "@/services/fireworks";
import { routePrompt } from "@/services/router";
import { getRequestApiKey, missingApiKeyResponse } from "@/lib/apiKey";
import { validateChatBody } from "@/lib/validateChat";

export async function POST(req: NextRequest) {
  try {
    const apiKey = getRequestApiKey(req);
    if (!apiKey) return missingApiKeyResponse();

    const parsed = validateChatBody(await req.json());
    if (!parsed.ok) {
      return new Response(JSON.stringify({ error: parsed.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { messages, model, temperature, maxTokens } = parsed.value;

    const lastMessage = messages[messages.length - 1]?.content || "";
    // The browser normally routes first and sends the chosen model; only
    // route here when it didn't, so each message costs one Laya call.
    const route = model ? null : await routePrompt(lastMessage);
    const selectedModel = model || route!.model;

    const stream = await completeStream({
      model: selectedModel,
      messages,
      temperature,
      maxTokens,
      apiKey,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({ type: "route", model: selectedModel, reason: route?.reason }) + "\n"
            )
          );
          for await (const chunk of stream) {
            controller.enqueue(
              encoder.encode(JSON.stringify({ type: "chunk", content: chunk }) + "\n")
            );
          }
          controller.enqueue(encoder.encode(JSON.stringify({ type: "done" }) + "\n"));
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "error",
                error: err instanceof Error ? err.message : "Stream error",
              }) + "\n"
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
