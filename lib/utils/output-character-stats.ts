import {
  type CharacterLimitMode,
  PLATFORM_IDS,
  type PlatformId,
  THREAD_PER_TWEET_LIMIT,
  getPlatformById,
} from "@/lib/constants/platforms";
import { getTwitterThreadStats } from "@/lib/utils/parse-twitter-thread";

export type CharacterCounterTone = "neutral" | "warning" | "error";

const COUNTER_WARNING_RATIO = 0.9;

export interface CharacterDisplayStats {
  counterText: string;
  secondaryText?: string;
  limitWarning: string | null;
  counterTone: CharacterCounterTone;
}

function getCounterTone(length: number, limit?: number): CharacterCounterTone {
  if (!limit) {
    return "neutral";
  }

  if (length > limit) {
    return "error";
  }

  if (length >= limit * COUNTER_WARNING_RATIO) {
    return "warning";
  }

  return "neutral";
}

function getLimitWarningMessage(
  title: string,
  length: number,
  limit?: number,
): string | null {
  if (!limit || length <= limit) {
    return null;
  }

  return `Önerilen limit aşıldı (${limit} karakter) — ${title}`;
}

function getTotalModeStats(
  content: string,
  limit: number | undefined,
  title: string,
): CharacterDisplayStats {
  const counterTone = getCounterTone(content.length, limit);

  return {
    counterText: limit
      ? `${content.length}/${limit} karakter`
      : `${content.length} karakter`,
    limitWarning: getLimitWarningMessage(title, content.length, limit),
    counterTone,
  };
}

function getPerSegmentModeStats(
  content: string,
  segmentLimit: number,
  title: string,
): CharacterDisplayStats {
  const stats = getTwitterThreadStats(content, segmentLimit);

  if (stats.tweetCount === 0) {
    return {
      counterText: `${content.length} karakter`,
      secondaryText: "Tweet ayrıştırılamadı",
      limitWarning: null,
      counterTone: "neutral",
    };
  }

  const counterTone = getCounterTone(stats.maxTweetLength, segmentLimit);
  const limitWarning =
    stats.violatingTweets.length > 0
      ? `Önerilen limit aşıldı (${segmentLimit} karakter/tweet) — ${title}`
      : null;

  return {
    counterText: `${stats.maxTweetLength}/${segmentLimit} karakter (en uzun tweet)`,
    secondaryText: `${stats.tweetCount} tweet · ${stats.totalLength} karakter toplam`,
    limitWarning,
    counterTone,
  };
}

/** Platform veya kart bağlamına göre karakter sayacı metriklerini üretir. */
export function getCharacterDisplayStats(options: {
  content: string;
  title: string;
  platformId?: PlatformId | null;
  characterLimit?: number;
  limitMode?: CharacterLimitMode;
}): CharacterDisplayStats {
  const { content, title, platformId, characterLimit, limitMode } = options;

  if (platformId === PLATFORM_IDS.TWITTER_THREAD || limitMode === "per_segment") {
    const segmentLimit =
      characterLimit ??
      getPlatformById(PLATFORM_IDS.TWITTER_THREAD).characterLimit;

    return getPerSegmentModeStats(content, segmentLimit, title);
  }

  return getTotalModeStats(content, characterLimit, title);
}

export function getCounterToneClassName(tone: CharacterCounterTone): string {
  switch (tone) {
    case "error":
      return "text-state-error";
    case "warning":
      return "text-state-warning";
    default:
      return "text-state-success";
  }
}

export { THREAD_PER_TWEET_LIMIT };
