"use client";

import { useCallback, useRef, useState } from "react";

import type { TransformRequestInput } from "@/lib/validation/transform-schema";
import { getGroqApiKeyHeaders } from "@/lib/utils/api-key-storage";
import type { SseChunkPayload, SseErrorPayload } from "@/lib/utils/sse";

export type TransformState =
  | "idle"
  | "loading"
  | "streaming"
  | "success"
  | "error";

type ParsedSseEvent =
  | { type: "chunk"; content: string }
  | { type: "error"; error: string }
  | { type: "done" };

const DEFAULT_ERROR_MESSAGE = "Bir hata oluştu. Lütfen tekrar deneyin.";

function parseSseBlock(block: string): ParsedSseEvent | null {
  const lines = block.split("\n").filter((line) => line.length > 0);
  let eventType: string | undefined;
  let dataLine: string | undefined;

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventType = line.slice("event:".length).trim();
      continue;
    }

    if (line.startsWith("data:")) {
      dataLine = line.slice("data:".length).trim();
    }
  }

  if (eventType === "error") {
    if (!dataLine) {
      return { type: "error", error: DEFAULT_ERROR_MESSAGE };
    }

    try {
      const payload = JSON.parse(dataLine) as SseErrorPayload;
      return {
        type: "error",
        error: payload.error || DEFAULT_ERROR_MESSAGE,
      };
    } catch {
      return { type: "error", error: DEFAULT_ERROR_MESSAGE };
    }
  }

  if (eventType === "done") {
    return { type: "done" };
  }

  if (!dataLine) {
    return null;
  }

  try {
    const payload = JSON.parse(dataLine) as SseChunkPayload;
    if (typeof payload.content === "string") {
      return { type: "chunk", content: payload.content };
    }
  } catch {
    return null;
  }

  return null;
}

function splitSseBuffer(buffer: string): {
  events: string[];
  remainder: string;
} {
  const parts = buffer.split("\n\n");
  const remainder = parts.pop() ?? "";

  return {
    events: parts.filter((part) => part.trim().length > 0),
    remainder,
  };
}

async function parseJsonError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? DEFAULT_ERROR_MESSAGE;
  } catch {
    return DEFAULT_ERROR_MESSAGE;
  }
}

export function useTransform() {
  const [state, setState] = useState<TransformState>("idle");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState("idle");
    setOutput("");
    setError(null);
  }, []);

  const transform = useCallback(async (request: TransformRequestInput) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState("loading");
    setOutput("");
    setError(null);

    try {
      const response = await fetch("/api/transform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getGroqApiKeyHeaders(),
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      const contentType = response.headers.get("content-type") ?? "";

      if (!response.ok || !contentType.includes("text/event-stream")) {
        const errorMessage = await parseJsonError(response);

        if (abortControllerRef.current !== controller) {
          return;
        }

        setError(errorMessage);
        setState("error");
        return;
      }

      const reader = response.body?.getReader();

      if (!reader) {
        if (abortControllerRef.current !== controller) {
          return;
        }

        setError(DEFAULT_ERROR_MESSAGE);
        setState("error");
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let hasStreamStarted = false;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        const { events, remainder } = splitSseBuffer(buffer);
        buffer = remainder;

        for (const eventBlock of events) {
          const parsed = parseSseBlock(eventBlock);

          if (!parsed) {
            continue;
          }

          if (abortControllerRef.current !== controller) {
            return;
          }

          if (parsed.type === "chunk") {
            if (!hasStreamStarted) {
              hasStreamStarted = true;
              setState("streaming");
            }

            setOutput((current) => current + parsed.content);
            continue;
          }

          if (parsed.type === "error") {
            setError(parsed.error);
            setState("error");
            return;
          }

          if (parsed.type === "done") {
            setState("success");
            return;
          }
        }
      }

      if (buffer.trim().length > 0) {
        const parsed = parseSseBlock(buffer);

        if (parsed && abortControllerRef.current === controller) {
          if (parsed.type === "chunk") {
            if (!hasStreamStarted) {
              setState("streaming");
            }

            setOutput((current) => current + parsed.content);
          } else if (parsed.type === "error") {
            setError(parsed.error);
            setState("error");
            return;
          } else if (parsed.type === "done") {
            setState("success");
            return;
          }
        }
      }

      if (abortControllerRef.current !== controller) {
        return;
      }

      if (hasStreamStarted) {
        setState("success");
      } else {
        setState("idle");
      }
    } catch (caughtError) {
      if (controller.signal.aborted || abortControllerRef.current !== controller) {
        return;
      }

      if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
        return;
      }

      console.error(caughtError);
      setError("Bağlantı hatası. İnternet bağlantınızı kontrol edin.");
      setState("error");
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  return {
    state,
    output,
    error,
    transform,
    reset,
  };
}
