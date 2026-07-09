import type { ParsedSeoMeta } from "@/lib/utils/parse-seo-meta";
import { parseSeoMeta } from "@/lib/utils/parse-seo-meta";

export const SEO_TITLE_MAX = 60;
export const SEO_DESCRIPTION_MAX = 155;

export interface NormalizedSeoMeta extends ParsedSeoMeta {
  titleTruncated?: boolean;
  descriptionTruncated?: boolean;
}

/** Metni kelime sınırında max karaktere kısaltır. */
export function truncateAtWordBoundary(text: string, max: number): string {
  const trimmed = text.trim();

  if (trimmed.length <= max) {
    return trimmed;
  }

  const slice = trimmed.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");

  if (lastSpace > max * 0.5) {
    return slice.slice(0, lastSpace).trim();
  }

  return slice.trim();
}

/**
 * Parse edilmiş SEO meta alanlarını limitlere göre normalize eder.
 * Yalnızca section tamamlandığında (applySectionEnd) çağrılmalıdır.
 */
export function normalizeSeoMeta(
  parsed: ParsedSeoMeta,
  raw?: string,
): NormalizedSeoMeta {
  const warnings = [...(parsed.warnings ?? [])];
  let title = parsed.title.trim();
  let description = parsed.description.trim();

  if (description.length === 0 && raw) {
    const reparsed = parseSeoMeta(raw);
    if (reparsed.description.length > 0) {
      description = reparsed.description.trim();
    }
  }

  let titleTruncated = false;
  let descriptionTruncated = false;

  if (title.length > SEO_TITLE_MAX) {
    title = truncateAtWordBoundary(title, SEO_TITLE_MAX);
    titleTruncated = true;
    warnings.push(`Başlık ${SEO_TITLE_MAX} karaktere kısaltıldı`);
  }

  if (description.length > SEO_DESCRIPTION_MAX) {
    description = truncateAtWordBoundary(description, SEO_DESCRIPTION_MAX);
    descriptionTruncated = true;
    warnings.push(`Açıklama ${SEO_DESCRIPTION_MAX} karaktere kısaltıldı`);
  }

  return {
    title,
    description,
    warnings: warnings.length > 0 ? warnings : undefined,
    titleTruncated,
    descriptionTruncated,
  };
}
