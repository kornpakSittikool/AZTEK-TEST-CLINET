import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recordMatchResult, type MatchResult } from "@/services/game.service";

function isMatchResult(value: unknown): value is MatchResult {
  return value === "WIN" || value === "LOSE" || value === "DRAW";
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const result = (body as { result?: unknown })?.result;
  if (!isMatchResult(result)) {
    return NextResponse.json({ error: "Invalid match result" }, { status: 400 });
  }

  try {
    const summary = await recordMatchResult(email, result);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Failed to record match result", error);
    return NextResponse.json({ error: "Failed to record match result" }, { status: 500 });
  }
}
