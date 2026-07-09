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

/** Kullanıcı prompt metnini oluşturur. */
export function buildUserPrompt(
  source: string,
  tone: Tone,
  audience: string | undefined,
  length: Length,
): string {
  const resolvedAudience =
    audience && audience.trim().length > 0 ? audience.trim() : "Genel okuyucu";

  return `Aşağıdaki kaynak içeriği belirtilen formata dönüştür.

Ton: ${mapToneToPrompt(tone)}
Hedef kitle: ${resolvedAudience}
Uzunluk: ${mapLengthToPrompt(length)}

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
      ),
    },
  ];
}
