import type { PlatformId } from "@/lib/constants/platforms";

export const TONES = {
  PROFESYONEL: "Profesyonel",
  SAMIMI: "Samimi",
  IKNA_EDICI: "İkna Edici",
} as const;

export type Tone = (typeof TONES)[keyof typeof TONES];

export const LENGTHS = {
  KISA: "Kısa",
  ORTA: "Orta",
  UZUN: "Uzun",
} as const;

export type Length = (typeof LENGTHS)[keyof typeof LENGTHS];

export interface TransformRequest {
  source: string;
  platform: PlatformId;
  tone: Tone;
  audience?: string;
  length: Length;
}

/** Bundle modunda kullanılan 4 sabit section id'si. */
export type BundleSectionId =
  | "seo-meta"
  | "linkedin"
  | "twitter-thread"
  | "instagram";

export const BUNDLE_SECTIONS = [
  "seo-meta",
  "linkedin",
  "twitter-thread",
  "instagram",
] as const satisfies readonly BundleSectionId[];

export interface TransformBundleRequest {
  source: string;
  tone: Tone;
  audience?: string;
  length: Length;
}

export type BundleStreamEvent =
  | { type: "section_start"; section: BundleSectionId }
  | { type: "chunk"; section: BundleSectionId; content: string }
  | { type: "section_end"; section: BundleSectionId };

export interface AIProvider {
  readonly name: string;
  transform(request: TransformRequest): AsyncIterable<string>;
  validateConfig(): Promise<boolean>;
}

/** Bundle section streaming destekleyen provider uzantısı. */
export interface BundleCapableProvider extends AIProvider {
  transformSection(
    section: BundleSectionId,
    base: Omit<TransformRequest, "platform">,
  ): AsyncIterable<string>;
}
