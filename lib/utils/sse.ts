import type { BundleSectionId } from "@/lib/ai/types";

export interface SseChunkPayload {
  content: string;
}

export interface SseErrorPayload {
  error: string;
}

export interface SseSectionPayload {
  section: BundleSectionId;
}

export interface SseSectionChunkPayload {
  section: BundleSectionId;
  content: string;
}

/** Token chunk'ını SSE data event olarak encode eder. */
export function encodeChunkEvent(content: string): string {
  const payload: SseChunkPayload = { content };
  return `data: ${JSON.stringify(payload)}\n\n`;
}

/** Hata durumunu SSE error event olarak encode eder. */
export function encodeErrorEvent(error: string): string {
  const payload: SseErrorPayload = { error };
  return `event: error\ndata: ${JSON.stringify(payload)}\n\n`;
}

/** Stream sonunu SSE done event olarak encode eder. */
export function encodeDoneEvent(): string {
  return `event: done\ndata: {}\n\n`;
}

/** Bundle section başlangıcını SSE event olarak encode eder. */
export function encodeSectionStartEvent(
  section: SseSectionPayload["section"],
): string {
  const payload: SseSectionPayload = { section };
  return `event: section_start\ndata: ${JSON.stringify(payload)}\n\n`;
}

/** Bundle section token chunk'ını SSE data event olarak encode eder. */
export function encodeSectionChunkEvent(
  section: SseSectionChunkPayload["section"],
  content: string,
): string {
  const payload: SseSectionChunkPayload = { section, content };
  return `data: ${JSON.stringify(payload)}\n\n`;
}

/** Bundle section bitişini SSE event olarak encode eder. */
export function encodeSectionEndEvent(
  section: SseSectionPayload["section"],
): string {
  const payload: SseSectionPayload = { section };
  return `event: section_end\ndata: ${JSON.stringify(payload)}\n\n`;
}
