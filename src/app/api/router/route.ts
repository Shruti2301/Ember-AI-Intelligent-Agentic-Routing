import { NextRequest, NextResponse } from "next/server";
import { routePrompt } from "@/services/router";
import { CHAT_LIMITS } from "@/lib/validateChat";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    if (prompt.length > CHAT_LIMITS.maxTotalChars) {
      return NextResponse.json({ error: "Prompt is too long" }, { status: 400 });
    }

    const decision = await routePrompt(prompt);
    return NextResponse.json(decision);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
