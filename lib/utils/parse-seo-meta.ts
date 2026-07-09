export interface ParsedSeoMeta {
  title: string;
  description: string;
}

const TITLE_PREFIX = /^BAŞLIK:\s*/i;
const DESCRIPTION_PREFIX = /^AÇIKLAMA:\s*/i;

/**
 * seo-meta section ham çıktısını BAŞLIK:/AÇIKLAMA: satırlarına parse eder.
 * Prefix bulunamazsa tüm metin title'a alınır, description boş kalır.
 */
export function parseSeoMeta(raw: string): ParsedSeoMeta {
  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    return { title: "", description: "" };
  }

  const lines = trimmed.split(/\r?\n/).map((line) => line.trim());
  let title = "";
  let description = "";

  for (const line of lines) {
    if (TITLE_PREFIX.test(line)) {
      title = line.replace(TITLE_PREFIX, "").trim();
      continue;
    }

    if (DESCRIPTION_PREFIX.test(line)) {
      description = line.replace(DESCRIPTION_PREFIX, "").trim();
    }
  }

  if (title.length === 0 && description.length === 0) {
    return { title: trimmed, description: "" };
  }

  return { title, description };
}
