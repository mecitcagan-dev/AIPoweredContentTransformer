import {
  getBundleSectionPrompt,
  getPlatformPrompt,
  SYSTEM_PROMPT,
} from "@/lib/ai/prompts";
import type {
  BundleSectionId,
  Length,
  Tone,
  TransformRequest,
} from "@/lib/ai/types";

const TONE_PROMPT_VALUES: Record<Tone, string> = {
  Profesyonel: "Resmi, güvenilir, sektörel dil; jargon ölçülü",
  Samimi: 'Sıcak, sohbet havasında, "sen" dili',
  "İkna Edici": "Harekete geçirici, fayda odaklı, güçlü CTA",
};

const LENGTH_INSTRUCTIONS: Record<Length, string> = {
  Kısa: "Platform limitinin %40'ına yakın, öz",
  Orta: "Platform limitinin %70'ine yakın, dengeli",
  Uzun: "Platform limitine yakın, detaylı",
};

const SEO_META_LENGTH_INSTRUCTIONS: Record<Length, string> = {
  Kısa: "Başlık en fazla ~25 karakter, açıklama en fazla ~60 karakter",
  Orta: "Başlık en fazla ~45 karakter, açıklama en fazla ~110 karakter",
  Uzun: "Başlık en fazla 60 karakter, açıklama en fazla 155 karakter",
};

export interface PromptMessage {
  role: "system" | "user";
  content: string;
}

/** UI ton değerini prompt talimatına çevirir. */
function mapToneToPrompt(tone: Tone): string {
  return TONE_PROMPT_VALUES[tone];
}

/** UI uzunluk değerini prompt talimatına çevirir. */
function mapLengthToPrompt(length: Length): string {
  return LENGTH_INSTRUCTIONS[length];
}

/** SEO meta section için çift limit uzunluk talimatı. */
function mapSeoMetaLengthToPrompt(length: Length): string {
  return SEO_META_LENGTH_INSTRUCTIONS[length];
}

/** Kullanıcı prompt metnini oluşturur. */
export function buildUserPrompt(
  source: string,
  tone: Tone,
  audience: string | undefined,
  length: Length,
  lengthInstruction?: string,
): string {
  const resolvedAudience =
    audience && audience.trim().length > 0 ? audience.trim() : "Genel okuyucu";
  const resolvedLength = lengthInstruction ?? mapLengthToPrompt(length);

  return `Aşağıdaki kaynak içeriği belirtilen formata dönüştür.

Ton: ${mapToneToPrompt(tone)}
Hedef kitle: ${resolvedAudience}
Uzunluk: ${resolvedLength}

--- KAYNAK İÇERİK ---
${source}
--- KAYNAK İÇERİK SONU ---`;
}

/** System ve user mesajlarını TransformRequest'ten oluşturur. */
export function buildMessages(request: TransformRequest): PromptMessage[] {
  const platformPrompt = getPlatformPrompt(request.platform);

  return [
    {
      role: "system",
      content: SYSTEM_PROMPT + platformPrompt,
    },
    {
      role: "user",
      content: buildUserPrompt(
        request.source,
        request.tone,
        request.audience,
        request.length,
      ),
    },
  ];
}

/** Bundle section için system ve user mesajlarını oluşturur. */
export function buildBundleSectionMessages(
  section: BundleSectionId,
  base: Omit<TransformRequest, "platform">,
): PromptMessage[] {
  const sectionPrompt = getBundleSectionPrompt(section);

  const lengthInstruction =
    section === "seo-meta" ? mapSeoMetaLengthToPrompt(base.length) : undefined;

  return [
    {
      role: "system",
      content: SYSTEM_PROMPT + sectionPrompt,
    },
    {
      role: "user",
      content: buildUserPrompt(
        base.source,
        base.tone,
        base.audience,
        base.length,
        lengthInstruction,
      ),
    },
  ];
}
