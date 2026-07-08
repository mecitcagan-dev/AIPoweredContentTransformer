import Groq from "groq-sdk";

import { buildMessages } from "@/lib/ai/prompt-engine";
import type { AIProvider, TransformRequest } from "@/lib/ai/types";
import { PLATFORM_IDS, type PlatformId } from "@/lib/constants/platforms";
import { withRetry } from "@/lib/utils/retry";

const GROQ_MODEL = "llama-3.3-70b-versatile";

const PLATFORM_MAX_TOKENS: Record<PlatformId, number> = {
  [PLATFORM_IDS.LINKEDIN]: 1024,
  [PLATFORM_IDS.TWITTER_THREAD]: 1024,
  [PLATFORM_IDS.INSTAGRAM]: 768,
  [PLATFORM_IDS.FACEBOOK]: 1024,
  [PLATFORM_IDS.NEWSLETTER]: 768,
  [PLATFORM_IDS.EMAIL_DRAFT]: 512,
  [PLATFORM_IDS.SHORT_SUMMARY]: 256,
  [PLATFORM_IDS.BULLET_SUMMARY]: 384,
};

const SUMMARY_PLATFORMS = new Set<PlatformId>([
  PLATFORM_IDS.SHORT_SUMMARY,
  PLATFORM_IDS.BULLET_SUMMARY,
]);

function getTemperature(platform: PlatformId): number {
  return SUMMARY_PLATFORMS.has(platform) ? 0.3 : 0.7;
}

function getMaxTokens(platform: PlatformId): number {
  return PLATFORM_MAX_TOKENS[platform];
}

function isValidGroqApiKey(apiKey: string | undefined): boolean {
  if (!apiKey || apiKey.trim().length === 0) {
    return false;
  }

  return /^gsk_[A-Za-z0-9]+$/.test(apiKey.trim());
}

export class GroqProvider implements AIProvider {
  readonly name = "groq";

  private readonly apiKey: string;
  private readonly client: Groq;

  /** @param apiKey İstek başına key (BYOK). Verilmezse `GROQ_API_KEY` env fallback. */
  constructor(apiKey?: string) {
    const resolvedKey = apiKey?.trim() || process.env.GROQ_API_KEY?.trim() || "";
    this.apiKey = resolvedKey;
    this.client = new Groq({
      apiKey: resolvedKey,
    });
  }

  async *transform(request: TransformRequest): AsyncIterable<string> {
    const messages = buildMessages(request);

    const stream = await withRetry(() =>
      this.client.chat.completions.create({
        model: GROQ_MODEL,
        messages,
        stream: true,
        temperature: getTemperature(request.platform),
        max_tokens: getMaxTokens(request.platform),
        top_p: 1,
        stop: null,
      }),
    );

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  async validateConfig(): Promise<boolean> {
    if (!isValidGroqApiKey(this.apiKey)) {
      return false;
    }

    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}
