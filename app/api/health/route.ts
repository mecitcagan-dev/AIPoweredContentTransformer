import { NextResponse } from "next/server";

import { createProvider } from "@/lib/ai/provider-factory";

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.trim().length === 0) {
    return NextResponse.json({
      ok: false,
      error:
        "API anahtarı bulunamadı. .env.local dosyasına GROQ_API_KEY ekleyin.",
    });
  }

  const provider = createProvider("groq");
  const isValid = await provider.validateConfig();

  if (!isValid) {
    return NextResponse.json({
      ok: false,
      error: "API anahtarı geçersiz görünüyor.",
    });
  }

  return NextResponse.json({ ok: true });
}
