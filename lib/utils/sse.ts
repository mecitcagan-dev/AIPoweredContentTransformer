export interface SseChunkPayload {
  content: string;
}

export interface SseErrorPayload {
  error: string;
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
