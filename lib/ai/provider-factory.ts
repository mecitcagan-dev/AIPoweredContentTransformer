import type { AIProvider } from "@/lib/ai/types";
import { GroqProvider } from "@/lib/ai/providers/groq-provider";

export type ProviderType = "groq";

/** Provider factory — yalnızca Groq implementasyonu (v1). */
export function createProvider(type: ProviderType, apiKey?: string): AIProvider {
  switch (type) {
    case "groq":
      return new GroqProvider(apiKey);
    default: {
      const exhaustiveCheck: never = type;
      throw new Error(`Unknown provider type: ${exhaustiveCheck}`);
    }
  }
}
