import { NextResponse } from "next/server";

import { createProvider } from "@/lib/ai/provider-factory";
import { resolveGroqApiKey } from "@/lib/utils/resolve-groq-api-key";

export async function GET(request: Request) {
  const apiKey = resolveGroqApiKey(request);

  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      error: "API anahtarı bulunamadı",
    });
  }

  const provider = createProvider("groq", apiKey);
  const isValid = await provider.validateConfig();

  if (!isValid) {
    return NextResponse.json({
      ok: false,
      error: "API anahtarı geçersiz görünüyor.",
    });
  }

  return NextResponse.json({ ok: true });
}
