import { createProvider } from "@/lib/ai/provider-factory";
import type { AIProvider, TransformRequest } from "@/lib/ai/types";

export class TransformOrchestrator {
  private readonly provider: AIProvider;

  constructor(provider: AIProvider = createProvider("groq")) {
    this.provider = provider;
  }

  /** Dönüşüm isteğini provider üzerinden streaming olarak yürütür. */
  transform(request: TransformRequest): AsyncIterable<string> {
    return this.provider.transform(request);
  }
}
