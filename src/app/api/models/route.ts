import { NextResponse } from "next/server";
import { FIREWORKS_MODELS } from "@/lib/models";

export async function GET() {
  return NextResponse.json(FIREWORKS_MODELS);
}
