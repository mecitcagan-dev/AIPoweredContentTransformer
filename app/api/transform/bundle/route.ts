import { NextResponse } from "next/server";
import { APIError } from "groq-sdk";

import { createProvider } from "@/lib/ai/provider-factory";
import { TransformOrchestrator } from "@/lib/ai/transform-orchestrator";
import type { BundleStreamEvent } from "@/lib/ai/types";
import { bundleRequestSchema } from "@/lib/validation/transform-schema";
import { getErrorStatus } from "@/lib/utils/retry";
import { resolveGroqApiKey } from "@/lib/utils/resolve-groq-api-key";
import {
  encodeDoneEvent,
  encodeErrorEvent,
  encodeSectionChunkEvent,
  encodeSectionEndEvent,
  encodeSectionStartEvent,
} from "@/lib/utils/sse";

function mapTransformError(error: unknown): {
  message: string;
  status: number;
} {
  const status = getErrorStatus(error);

  if (status === 429) {
    return {
      message: "Çok fazla istek. Lütfen biraz bekleyip tekrar deneyin.",
      status: 429,
    };
  }

  if (status === 401) {
    return {
      message: "API anahtarı geçersiz görünüyor.",
      status: 500,
    };
  }

  if (status !== undefined && status >= 500) {
    return {
      message: "Bir hata oluştu. Lütfen tekrar deneyin.",
      status: 500,
    };
  }

  if (
    error instanceof TypeError ||
    (error instanceof APIError && status === undefined)
  ) {
    return {
      message: "Bağlantı hatası. İnternet bağlantınızı kontrol edin.",
      status: 500,
    };
  }

  return {
    message: "Bir hata oluştu. Lütfen tekrar deneyin.",
    status: 500,
  };
}

function createSseResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function encodeBundleEvent(event: BundleStreamEvent): string {
  switch (event.type) {
    case "section_start":
      return encodeSectionStartEvent(event.section);
    case "chunk":
      return encodeSectionChunkEvent(event.section, event.content);
    case "section_end":
      return encodeSectionEndEvent(event.section);
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 },
    );
  }

  const parsed = bundleRequestSchema.safeParse(body);

  if (!parsed.success) {
    const error =
      parsed.error.issues[0]?.message ?? "Geçersiz dönüşüm isteği.";
    return NextResponse.json({ error }, { status: 400 });
  }

  const apiKey = resolveGroqApiKey(request);

  if (!apiKey) {
    return NextResponse.json(
      { error: "API anahtarı bulunamadı" },
      { status: 400 },
    );
  }

  const orchestrator = new TransformOrchestrator(createProvider("groq", apiKey));
  const bundleStream = orchestrator.transformBundle(parsed.data);
  const iterator = bundleStream[Symbol.asyncIterator]();

  let firstResult: IteratorResult<BundleStreamEvent>;

  try {
    firstResult = await iterator.next();
  } catch (error) {
    console.error(error);
    const { message, status } = mapTransformError(error);
    return NextResponse.json({ error: message }, { status });
  }

  const sseStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        if (!firstResult.done) {
          controller.enqueue(
            encoder.encode(encodeBundleEvent(firstResult.value)),
          );
        }

        while (true) {
          const result = await iterator.next();
          if (result.done) {
            break;
          }

          controller.enqueue(encoder.encode(encodeBundleEvent(result.value)));
        }

        controller.enqueue(encoder.encode(encodeDoneEvent()));
        controller.close();
      } catch (error) {
        console.error(error);
        const { message } = mapTransformError(error);
        controller.enqueue(encoder.encode(encodeErrorEvent(message)));
        controller.close();
      }
    },
  });

  return createSseResponse(sseStream);
}
