const GROQ_API_KEY_HEADER = "x-groq-api-key";

/**
 * İstek header'ından veya env'den Groq API anahtarını çözer (server-only).
 * Header önceliklidir; header yoksa local geliştirme için env fallback uygulanır.
 */
export function resolveGroqApiKey(request: Request): string | null {
  const headerKey = request.headers.get(GROQ_API_KEY_HEADER)?.trim();

  if (headerKey && headerKey.length > 0) {
    return headerKey;
  }

  const envKey = process.env.GROQ_API_KEY?.trim();

  if (envKey && envKey.length > 0) {
    return envKey;
  }

  return null;
}
