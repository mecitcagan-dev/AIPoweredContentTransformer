export interface ParsedSeoMeta {
  title: string;
  description: string;
  warnings?: string[];
}

type SeoFieldLabel = "BAŞLIK" | "AÇIKLAMA";

function hasFieldPrefix(line: string, label: SeoFieldLabel): boolean {
  const prefix = `${label}:`;
  return line.trim().toLocaleUpperCase("tr-TR").startsWith(prefix);
}

function extractFieldValue(line: string, label: SeoFieldLabel): string {
  const prefix = `${label}:`;
  const trimmed = line.trim();
  const upper = trimmed.toLocaleUpperCase("tr-TR");
  const prefixIndex = upper.indexOf(prefix);

  if (prefixIndex === -1) {
    return "";
  }

  return trimmed.slice(prefixIndex + prefix.length).trim();
}

function parseInlineBothFields(trimmed: string): ParsedSeoMeta | null {
  const upper = trimmed.toLocaleUpperCase("tr-TR");
  const descriptionIndex = upper.indexOf("AÇIKLAMA:");

  if (!upper.startsWith("BAŞLIK:") || descriptionIndex === -1) {
    return null;
  }

  const title = trimmed
    .slice("BAŞLIK:".length, descriptionIndex)
    .trim();
  const description = trimmed
    .slice(descriptionIndex + "AÇIKLAMA:".length)
    .trim();

  if (title.length === 0 && description.length === 0) {
    return null;
  }

  return { title, description, warnings: [] };
}

/**
 * seo-meta section ham çıktısını BAŞLIK:/AÇIKLAMA: alanlarına parse eder.
 * Prefix bulunamazsa tüm metin title'a alınır, description boş kalır.
 */
export function parseSeoMeta(raw: string): ParsedSeoMeta {
  const trimmed = raw.trim();
  const warnings: string[] = [];

  if (trimmed.length === 0) {
    return { title: "", description: "", warnings };
  }

  const inline = parseInlineBothFields(trimmed);
  if (inline) {
    return inline;
  }

  const lines = trimmed.split(/\r?\n/);
  let title = "";
  let description = "";
  let descriptionLines: string[] = [];
  let collectingDescription = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.length === 0) {
      if (collectingDescription) {
        descriptionLines.push("");
      }
      continue;
    }

    if (hasFieldPrefix(line, "BAŞLIK")) {
      collectingDescription = false;
      descriptionLines = [];
      title = extractFieldValue(line, "BAŞLIK");
      continue;
    }

    if (hasFieldPrefix(line, "AÇIKLAMA")) {
      collectingDescription = true;
      descriptionLines = [extractFieldValue(line, "AÇIKLAMA")];
      continue;
    }

    if (collectingDescription) {
      descriptionLines.push(line);
    }
  }

  if (descriptionLines.length > 0) {
    description = descriptionLines.join("\n").trim();
  }

  if (title.length === 0 && description.length === 0) {
    return { title: trimmed, description: "", warnings };
  }

  if (title.length > 0 && description.length === 0) {
    warnings.push("Açıklama ayrıştırılamadı");
  }

  return { title, description, warnings };
}
