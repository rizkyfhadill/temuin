import { NextResponse } from "next/server";
import { aiChatAssistant } from "@/lib/ai";

// POST /api/ai/chat  body: { question, sourceTitle?, candidateTitle? }
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const answer = await aiChatAssistant(body.question || "", {
    sourceTitle: body.sourceTitle,
    candidateTitle: body.candidateTitle,
  });
  return NextResponse.json({ answer });
}
