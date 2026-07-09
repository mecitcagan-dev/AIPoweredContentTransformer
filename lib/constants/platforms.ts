export const PLATFORM_IDS = {
  LINKEDIN: "linkedin",
  TWITTER_THREAD: "twitter-thread",
  INSTAGRAM: "instagram",
  FACEBOOK: "facebook",
  NEWSLETTER: "newsletter",
  EMAIL_DRAFT: "email-draft",
  SHORT_SUMMARY: "short-summary",
  BULLET_SUMMARY: "bullet-summary",
  BLOG: "blog",
} as const;

export type PlatformId = (typeof PLATFORM_IDS)[keyof typeof PLATFORM_IDS];

/** X Thread: characterLimit tweet başına geçerlidir; toplam thread uzunluğu değil. */
export const THREAD_PER_TWEET_LIMIT = 280;

/** Karakter limitinin nasıl yorumlanacağını belirler. */
export type CharacterLimitMode = "total" | "per_segment";

/** Lucide React icon adları (brand ikonları pakette yok; semantik eşleme). */
export type PlatformIconName =
  | "Briefcase"
  | "MessageCircle"
  | "Image"
  | "Share2"
  | "Newspaper"
  | "Mail"
  | "Text"
  | "List"
  | "PenLine";

export interface PlatformMetadata {
  id: PlatformId;
  label: string;
  icon: PlatformIconName;
  characterLimit: number;
  /** Varsayılan: total. X Thread gibi çok parçalı formatlarda per_segment. */
  characterLimitMode?: CharacterLimitMode;
  description: string;
}

export const PLATFORMS: readonly PlatformMetadata[] = [
  {
    id: PLATFORM_IDS.LINKEDIN,
    label: "LinkedIn Post",
    icon: "Briefcase",
    characterLimit: 3000,
    description: "Max 3000 karakter, güçlü hook + paragraflar + CTA + hashtag",
  },
  {
    id: PLATFORM_IDS.TWITTER_THREAD,
    label: "X Thread",
    icon: "MessageCircle",
    characterLimit: THREAD_PER_TWEET_LIMIT,
    characterLimitMode: "per_segment",
    description: "Max 280 karakter/tweet, 3–7 tweet thread, hook + CTA",
  },
  {
    id: PLATFORM_IDS.INSTAGRAM,
    label: "Instagram Caption",
    icon: "Image",
    characterLimit: 2200,
    description: "Max 2200 karakter, emoji + CTA + hashtag bloğu",
  },
  {
    id: PLATFORM_IDS.FACEBOOK,
    label: "Facebook Post",
    icon: "Share2",
    characterLimit: 5000,
    description: "Max 5000 karakter, samimi ton + etkileşim sorusu + emoji",
  },
  {
    id: PLATFORM_IDS.NEWSLETTER,
    label: "Newsletter",
    icon: "Newspaper",
    characterLimit: 1500,
    description: "Max 1500 karakter, konu satırı + 3 bölüm + CTA",
  },
  {
    id: PLATFORM_IDS.EMAIL_DRAFT,
    label: "E-posta Taslağı",
    icon: "Mail",
    characterLimit: 800,
    description: "Max 800 karakter, konu satırı + kısa gövde + CTA",
  },
  {
    id: PLATFORM_IDS.SHORT_SUMMARY,
    label: "Kısa Özet",
    icon: "Text",
    characterLimit: 300,
    description: "Max 300 karakter, 2–3 cümle özet",
  },
  {
    id: PLATFORM_IDS.BULLET_SUMMARY,
    label: "Madde Özet",
    icon: "List",
    characterLimit: 500,
    description: "Max 500 karakter, 5–7 madde listesi",
  },
  {
    id: PLATFORM_IDS.BLOG,
    label: "Blog Yazısı",
    icon: "PenLine",
    characterLimit: 6000,
    description: "Max 6000 karakter, başlık + alt başlıklar + CTA",
  },
] as const;

/** Platform metadata kaydına id ile erişim. */
export const PLATFORM_BY_ID: Record<PlatformId, PlatformMetadata> =
  PLATFORMS.reduce(
    (acc, platform) => {
      acc[platform.id] = platform;
      return acc;
    },
    {} as Record<PlatformId, PlatformMetadata>,
  );

/** Verilen değerin geçerli bir PlatformId olup olmadığını kontrol eder. */
export function isPlatformId(value: string): value is PlatformId {
  return PLATFORMS.some((platform) => platform.id === value);
}

/** Platform metadata'sını id ile döndürür. */
export function getPlatformById(id: PlatformId): PlatformMetadata {
  return PLATFORM_BY_ID[id];
}
