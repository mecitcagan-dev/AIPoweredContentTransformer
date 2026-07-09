import { createProvider } from "@/lib/ai/provider-factory";
import {
  BUNDLE_SECTIONS,
  type AIProvider,
  type BundleCapableProvider,
  type BundleStreamEvent,
  type TransformBundleRequest,
  type TransformRequest,
} from "@/lib/ai/types";

function isBundleCapableProvider(
  provider: AIProvider,
): provider is BundleCapableProvider {
  return (
    "transformSection" in provider &&
    typeof provider.transformSection === "function"
  );
}

export class TransformOrchestrator {
  private readonly provider: AIProvider;

  constructor(provider: AIProvider = createProvider("groq")) {
    this.provider = provider;
  }

  /** Dönüşüm isteğini provider üzerinden streaming olarak yürütür. */
  transform(request: TransformRequest): AsyncIterable<string> {
    return this.provider.transform(request);
  }

  /** Bundle isteğini sıralı section stream event'leri olarak yürütür. */
  async *transformBundle(
    request: TransformBundleRequest,
  ): AsyncIterable<BundleStreamEvent> {
    if (!isBundleCapableProvider(this.provider)) {
      throw new Error("Provider bundle dönüşümünü desteklemiyor");
    }

    const base: Omit<TransformRequest, "platform"> = {
      source: request.source,
      tone: request.tone,
      audience: request.audience,
      length: request.length,
    };

    for (const section of BUNDLE_SECTIONS) {
      yield { type: "section_start", section };

      for await (const content of this.provider.transformSection(
        section,
        base,
      )) {
        yield { type: "chunk", section, content };
      }

      yield { type: "section_end", section };
    }
  }
}
