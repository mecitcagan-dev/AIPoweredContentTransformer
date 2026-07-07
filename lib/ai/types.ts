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

export interface AIProvider {
  readonly name: string;
  transform(request: TransformRequest): AsyncIterable<string>;
  validateConfig(): Promise<boolean>;
}
