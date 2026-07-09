import type { BundleSectionId } from "@/lib/ai/types";
import { PLATFORM_IDS, type PlatformId } from "@/lib/constants/platforms";

import { BULLET_SUMMARY_PROMPT } from "./bullet-summary";
import { EMAIL_DRAFT_PROMPT } from "./email-draft";
import { FACEBOOK_PROMPT } from "./facebook";
import { INSTAGRAM_PROMPT } from "./instagram";
import { LINKEDIN_PROMPT } from "./linkedin";
import { NEWSLETTER_PROMPT } from "./newsletter";
import { SEO_META_PROMPT } from "./seo-meta";
import { SHORT_SUMMARY_PROMPT } from "./short-summary";
import { TWITTER_THREAD_PROMPT } from "./twitter-thread";

export { SYSTEM_PROMPT } from "./system";

export const PLATFORM_PROMPTS = {
  [PLATFORM_IDS.LINKEDIN]: LINKEDIN_PROMPT,
  [PLATFORM_IDS.TWITTER_THREAD]: TWITTER_THREAD_PROMPT,
  [PLATFORM_IDS.INSTAGRAM]: INSTAGRAM_PROMPT,
  [PLATFORM_IDS.FACEBOOK]: FACEBOOK_PROMPT,
  [PLATFORM_IDS.NEWSLETTER]: NEWSLETTER_PROMPT,
  [PLATFORM_IDS.EMAIL_DRAFT]: EMAIL_DRAFT_PROMPT,
  [PLATFORM_IDS.SHORT_SUMMARY]: SHORT_SUMMARY_PROMPT,
  [PLATFORM_IDS.BULLET_SUMMARY]: BULLET_SUMMARY_PROMPT,
} as const satisfies Record<PlatformId, string>;

/** Platform prompt metnini id ile döndürür. */
export function getPlatformPrompt(platformId: PlatformId): string {
  return PLATFORM_PROMPTS[platformId];
}

/** Bundle section prompt metnini id ile döndürür. */
export function getBundleSectionPrompt(section: BundleSectionId): string {
  if (section === "seo-meta") {
    return SEO_META_PROMPT;
  }

  return PLATFORM_PROMPTS[section];
}
