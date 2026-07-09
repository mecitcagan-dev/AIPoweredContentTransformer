"use client";

import { useCallback, useRef, useState } from "react";

import { BUNDLE_SECTIONS, type BundleSectionId } from "@/lib/ai/types";
import type { TransformBundleRequestInput } from "@/lib/validation/transform-schema";
import { getGroqApiKeyHeaders } from "@/lib/utils/api-key-storage";
import { normalizeSeoMeta } from "@/lib/utils/normalize-seo-meta";
import { parseSeoMeta } from "@/lib/utils/parse-seo-meta";
import type {
  SseErrorPayload,
  SseSectionChunkPayload,
  SseSectionPayload,
} from "@/lib/utils/sse";
import type {
  BundleOutput,
  BundleSectionState,
  BundleTransformState,
} from "@/types/transform";

type ParsedBundleSseEvent =
  | { type: "section_start"; section: BundleSectionId }
  | { type: "section_end"; section: BundleSectionId }
  | { type: "chunk"; section: BundleSectionId; content: string }
  | { type: "error"; error: string }
  | { type: "done" };

const DEFAULT_ERROR_MESSAGE = "Bir hata oluştu. Lütfen tekrar deneyin.";

function isBundleSectionId(value: string): value is BundleSectionId {
  return (BUNDLE_SECTIONS as readonly string[]).includes(value);
}

function createInitialSections(): Record<BundleSectionId, BundleSectionState> {
  return {
    "seo-meta": { content: "", status: "pending" },
    linkedin: { content: "", status: "pending" },
    "twitter-thread": { content: "", status: "pending" },
    instagram: { content: "", status: "pending" },
  };
}

function createInitialBundleOutput(): BundleOutput {
  return {
    sections: createInitialSections(),
    activeSection: null,
    seoTitle: "",
    seoDescription: "",
  };
}

function parseBundleSseBlock(block: string): ParsedBundleSseEvent | null {
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

  if (eventType === "section_start" || eventType === "section_end") {
    if (!dataLine) {
      return null;
    }

    try {
      const payload = JSON.parse(dataLine) as SseSectionPayload;
      if (!isBundleSectionId(payload.section)) {
        return null;
      }

      return eventType === "section_start"
        ? { type: "section_start", section: payload.section }
        : { type: "section_end", section: payload.section };
    } catch {
      return null;
    }
  }

  if (!dataLine) {
    return null;
  }

  try {
    const payload = JSON.parse(dataLine) as SseSectionChunkPayload;
    if (
      typeof payload.content === "string" &&
      isBundleSectionId(payload.section)
    ) {
      return {
        type: "chunk",
        section: payload.section,
        content: payload.content,
      };
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

function getSectionIndex(section: BundleSectionId): number {
  return BUNDLE_SECTIONS.indexOf(section);
}

function applySectionStart(
  output: BundleOutput,
  section: BundleSectionId,
): BundleOutput {
  return {
    ...output,
    activeSection: section,
    sections: {
      ...output.sections,
      [section]: {
        ...output.sections[section],
        status: "streaming",
      },
    },
  };
}

function applySectionChunk(
  output: BundleOutput,
  section: BundleSectionId,
  content: string,
): BundleOutput {
  return {
    ...output,
    sections: {
      ...output.sections,
      [section]: {
        ...output.sections[section],
        content: output.sections[section].content + content,
      },
    },
  };
}

function applySectionEnd(
  output: BundleOutput,
  section: BundleSectionId,
): BundleOutput {
  const sectionContent = output.sections[section].content;
  const nextOutput: BundleOutput = {
    ...output,
    activeSection: null,
    sections: {
      ...output.sections,
      [section]: {
        content: sectionContent,
        status: "complete",
      },
    },
  };

  if (section !== "seo-meta") {
    return nextOutput;
  }

  const parsed = parseSeoMeta(sectionContent);
  const normalized = normalizeSeoMeta(parsed, sectionContent);

  return {
    ...nextOutput,
    seoTitle: normalized.title,
    seoDescription: normalized.description,
  };
}

function applyStreamError(
  output: BundleOutput,
  failedSection: BundleSectionId | null,
  errorMessage: string,
): {
  output: BundleOutput;
  bundleState: BundleTransformState;
  error: string;
} {
  const hasComplete = BUNDLE_SECTIONS.some(
    (section) => output.sections[section].status === "complete",
  );

  const nextSections = { ...output.sections };

  if (failedSection) {
    nextSections[failedSection] = {
      ...nextSections[failedSection],
      status: "error",
    };

    const failedIndex = getSectionIndex(failedSection);

    for (let index = failedIndex + 1; index < BUNDLE_SECTIONS.length; index++) {
      const pendingSection = BUNDLE_SECTIONS[index];
      nextSections[pendingSection] = {
        content: "",
        status: "pending",
      };
    }
  }

  return {
    output: {
      ...output,
      sections: nextSections,
      activeSection: null,
    },
    bundleState: hasComplete ? "partial_error" : "error",
    error: errorMessage,
  };
}

export function useTransformBundle() {
  const [bundleState, setBundleState] =
    useState<BundleTransformState>("idle");
  const [bundleOutput, setBundleOutput] = useState<BundleOutput>(
    createInitialBundleOutput,
  );
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeSectionRef = useRef<BundleSectionId | null>(null);

  const cancelBundle = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    activeSectionRef.current = null;
    setBundleOutput((current) => ({
      ...current,
      activeSection: null,
    }));
    setBundleState((current) =>
      current === "loading" || current === "streaming" ? "idle" : current,
    );
  }, []);

  const resetBundle = useCallback(() => {
    cancelBundle();
    setBundleState("idle");
    setBundleOutput(createInitialBundleOutput());
    setError(null);
  }, [cancelBundle]);

  const transformBundle = useCallback(
    async (request: TransformBundleRequestInput) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      activeSectionRef.current = null;

      setBundleState("loading");
      setBundleOutput(createInitialBundleOutput());
      setError(null);

      try {
        const response = await fetch("/api/transform/bundle", {
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
          setBundleState("error");
          return;
        }

        const reader = response.body?.getReader();

        if (!reader) {
          if (abortControllerRef.current !== controller) {
            return;
          }

          setError(DEFAULT_ERROR_MESSAGE);
          setBundleState("error");
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let hasStreamStarted = false;
        let latestOutput = createInitialBundleOutput();

        const processEvent = (parsed: ParsedBundleSseEvent): boolean => {
          if (abortControllerRef.current !== controller) {
            return false;
          }

          if (parsed.type === "section_start") {
            if (!hasStreamStarted) {
              hasStreamStarted = true;
              setBundleState("streaming");
            }

            activeSectionRef.current = parsed.section;
            latestOutput = applySectionStart(latestOutput, parsed.section);
            setBundleOutput(latestOutput);
            return true;
          }

          if (parsed.type === "chunk") {
            if (!hasStreamStarted) {
              hasStreamStarted = true;
              setBundleState("streaming");
            }

            latestOutput = applySectionChunk(
              latestOutput,
              parsed.section,
              parsed.content,
            );
            setBundleOutput(latestOutput);
            return true;
          }

          if (parsed.type === "section_end") {
            activeSectionRef.current = null;
            latestOutput = applySectionEnd(latestOutput, parsed.section);
            setBundleOutput(latestOutput);
            return true;
          }

          if (parsed.type === "error") {
            const failedSection = activeSectionRef.current;
            activeSectionRef.current = null;

            const errorResult = applyStreamError(
              latestOutput,
              failedSection,
              parsed.error,
            );

            latestOutput = errorResult.output;
            setBundleOutput(latestOutput);
            setError(errorResult.error);
            setBundleState(errorResult.bundleState);
            return false;
          }

          if (parsed.type === "done") {
            activeSectionRef.current = null;
            setBundleState("success");
            return false;
          }

          return true;
        };

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          const { events, remainder } = splitSseBuffer(buffer);
          buffer = remainder;

          for (const eventBlock of events) {
            const parsed = parseBundleSseBlock(eventBlock);

            if (!parsed) {
              continue;
            }

            const shouldContinue = processEvent(parsed);

            if (!shouldContinue) {
              return;
            }
          }
        }

        if (buffer.trim().length > 0) {
          const parsed = parseBundleSseBlock(buffer);

          if (parsed) {
            const shouldContinue = processEvent(parsed);

            if (!shouldContinue) {
              return;
            }
          }
        }

        if (abortControllerRef.current !== controller) {
          return;
        }

        if (hasStreamStarted) {
          setBundleState("success");
        } else {
          setBundleState("idle");
        }
      } catch (caughtError) {
        if (
          controller.signal.aborted ||
          abortControllerRef.current !== controller
        ) {
          return;
        }

        if (
          caughtError instanceof DOMException &&
          caughtError.name === "AbortError"
        ) {
          return;
        }

        console.error(caughtError);
        setError("Bağlantı hatası. İnternet bağlantınızı kontrol edin.");
        setBundleState("error");
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }

        activeSectionRef.current = null;
      }
    },
    [],
  );

  return {
    bundleOutput,
    bundleState,
    error,
    transformBundle,
    resetBundle,
    cancelBundle,
  };
}
