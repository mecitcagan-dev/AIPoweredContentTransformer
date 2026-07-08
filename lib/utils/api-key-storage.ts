/** Client-side Groq API key localStorage anahtarı (`repack_` prefix). */
export const GROQ_API_KEY_STORAGE_KEY = "repack_groq_api_key";

/** İstek header adı — client ve server aynı değeri kullanır. */
export const GROQ_API_KEY_HEADER = "x-groq-api-key";

/** Tarayıcıda saklanan Groq API anahtarını döndürür. */
export function getStoredApiKey(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(GROQ_API_KEY_STORAGE_KEY);
}

/** Groq API anahtarını tarayıcıda saklar. */
export function setStoredApiKey(key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(GROQ_API_KEY_STORAGE_KEY, key.trim());
}

/** Tarayıcıdan saklanan Groq API anahtarını siler. */
export function clearStoredApiKey(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(GROQ_API_KEY_STORAGE_KEY);
}

/** Fetch istekleri için Groq API key header'ını oluşturur. */
export function getGroqApiKeyHeaders(): Record<string, string> {
  const apiKey = getStoredApiKey();

  if (!apiKey) {
    return {};
  }

  return {
    [GROQ_API_KEY_HEADER]: apiKey,
  };
}
