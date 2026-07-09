/**
 * Site-wide SEO constants and URL helpers.
 * OG color values mirror ui-context.md tokens (--bg-base, --accent-primary, --text-primary).
 */

export const SITE_NAME = "İçerik Dönüştürücü" as const;

export const SITE_TITLE = "İçerik Dönüştürücü" as const;

export const SITE_DESCRIPTION =
  "İçerik Dönüştürücü (Repack), mevcut makale ve metinlerinizi AI ile LinkedIn, X, Instagram ve 8 platform formatına yeniden paketler. Tek tıkla, streaming çıktı." as const;

export const SITE_KEYWORDS = [
  "içerik dönüştürücü",
  "repack",
  "içerik yeniden paketleme",
  "AI içerik aracı",
  "LinkedIn post",
  "Twitter thread",
  "Instagram caption",
  "sosyal medya içerik",
  "Groq AI",
] as const;

export const SITE_AUTHOR = "Repack" as const;

export const DEFAULT_SITE_URL = "https://repack-app.vercel.app" as const;

/** ui-context.md: --bg-base, --accent-primary, --text-primary */
export const OG_COLORS = {
  bgBase: "#0a0a0f",
  accentPrimary: "#6366f1",
  textPrimary: "#f4f4f5",
  textMuted: "#a1a1aa",
} as const;

/** Resolves the canonical site URL for metadata, sitemap, and robots. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return DEFAULT_SITE_URL;
}

/** Whether search engines should index the site (production only, unless overridden). */
export function isIndexable(): boolean {
  if (process.env.SEO_NOINDEX === "true") {
    return false;
  }

  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv && vercelEnv !== "production") {
    return false;
  }

  return true;
}
