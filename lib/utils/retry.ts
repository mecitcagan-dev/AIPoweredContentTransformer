import { APIError } from "groq-sdk";

const MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAYS_MS = [1000, 2000, 4000] as const;

/** 429 ve 5xx yanıtlarının retry edilebilir olup olmadığını döndürür. */
export function isRetryableHttpStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

/** Hata nesnesinden HTTP status kodunu çıkarır. */
export function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof APIError) {
    return error.status;
  }

  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status: unknown }).status;
    if (typeof status === "number") {
      return status;
    }
  }

  return undefined;
}

/** Hatanın ön-istek retry politikasına uygun olup olmadığını döndürür. */
export function isRetryableError(error: unknown): boolean {
  const status = getErrorStatus(error);
  return status !== undefined && isRetryableHttpStatus(status);
}

function getRetryAfterMs(headers: Headers | undefined): number | null {
  if (!headers) {
    return null;
  }

  const retryAfter = headers.get("retry-after");
  if (!retryAfter) {
    return null;
  }

  const seconds = Number(retryAfter);
  if (!Number.isNaN(seconds)) {
    return seconds * 1000;
  }

  const date = Date.parse(retryAfter);
  if (!Number.isNaN(date)) {
    return Math.max(0, date - Date.now());
  }

  return null;
}

function getErrorHeaders(error: unknown): Headers | undefined {
  if (error instanceof APIError) {
    return error.headers;
  }

  if (error && typeof error === "object" && "headers" in error) {
    const headers = (error as { headers: unknown }).headers;
    if (headers instanceof Headers) {
      return headers;
    }
  }

  return undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface RetryOptions {
  maxAttempts?: number;
  delaysMs?: readonly number[];
}

/** 429/5xx hatalarında exponential backoff ile generic retry wrapper. */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? MAX_ATTEMPTS;
  const delaysMs = options.delaysMs ?? DEFAULT_RETRY_DELAYS_MS;

  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error) || attempt === maxAttempts - 1) {
        throw error;
      }

      const retryAfterMs = getRetryAfterMs(getErrorHeaders(error));
      const delayMs =
        retryAfterMs ?? delaysMs[attempt] ?? delaysMs[delaysMs.length - 1];

      await sleep(delayMs);
    }
  }

  throw lastError;
}
