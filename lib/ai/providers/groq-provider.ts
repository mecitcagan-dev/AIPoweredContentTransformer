import Groq from "groq-sdk";

import {
  buildBundleSectionMessages,
  buildMessages,
  type PromptMessage,
} from "@/lib/ai/prompt-engine";
import type {
  BundleCapableProvider,
  BundleSectionId,
  TransformRequest,
} from "@/lib/ai/types";
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

const BUNDLE_SECTION_MAX_TOKENS: Record<BundleSectionId, number> = {
  "seo-meta": 256,
  [PLATFORM_IDS.LINKEDIN]: PLATFORM_MAX_TOKENS[PLATFORM_IDS.LINKEDIN],
  [PLATFORM_IDS.TWITTER_THREAD]:
    PLATFORM_MAX_TOKENS[PLATFORM_IDS.TWITTER_THREAD],
  [PLATFORM_IDS.INSTAGRAM]: PLATFORM_MAX_TOKENS[PLATFORM_IDS.INSTAGRAM],
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

function getBundleSectionTemperature(section: BundleSectionId): number {
  if (section === "seo-meta") {
    return 0.3;
  }

  return getTemperature(section);
}

function getBundleSectionMaxTokens(section: BundleSectionId): number {
  return BUNDLE_SECTION_MAX_TOKENS[section];
}

function isValidGroqApiKey(apiKey: string | undefined): boolean {
  if (!apiKey || apiKey.trim().length === 0) {
    return false;
  }

  return /^gsk_[A-Za-z0-9]+$/.test(apiKey.trim());
}

export class GroqProvider implements BundleCapableProvider {
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

    yield* this.streamMessages(messages, {
      temperature: getTemperature(request.platform),
      max_tokens: getMaxTokens(request.platform),
    });
  }

  async *transformSection(
    section: BundleSectionId,
    base: Omit<TransformRequest, "platform">,
  ): AsyncIterable<string> {
    const messages = buildBundleSectionMessages(section, base);

    yield* this.streamMessages(messages, {
      temperature: getBundleSectionTemperature(section),
      max_tokens: getBundleSectionMaxTokens(section),
    });
  }

  private async *streamMessages(
    messages: PromptMessage[],
    options: { temperature: number; max_tokens: number },
  ): AsyncIterable<string> {
    const stream = await withRetry(() =>
      this.client.chat.completions.create({
        model: GROQ_MODEL,
        messages,
        stream: true,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
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
