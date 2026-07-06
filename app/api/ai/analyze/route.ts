import { NextResponse } from "next/server";
import { analyzeImage } from "@/lib/ai";

// POST /api/ai/analyze  body: { fileName?, mimeType?, base64?, hint? }
// Gemini Vision analysis (falls back to deterministic heuristic without a key).
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await analyzeImage({
    fileName: body.fileName,
    mimeType: body.mimeType,
    base64: body.base64,
    hint: body.hint,
  });
  return NextResponse.json(result);
}
