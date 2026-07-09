import { THREAD_PER_TWEET_LIMIT } from "@/lib/constants/platforms";

const TWEET_START_PATTERN = /^\d+\//;

export interface TwitterThreadTweet {
  index: number;
  content: string;
  length: number;
}

export interface TwitterThreadStats {
  tweets: TwitterThreadTweet[];
  tweetCount: number;
  totalLength: number;
  maxTweetLength: number;
  violatingTweets: TwitterThreadTweet[];
}

/**
 * X Thread ham çıktısını numaralı tweet segmentlerine böler.
 * Her segment "N/" ile başlayan satırdan sonraki "M/" satırına kadar uzanır.
 */
export function parseTwitterThread(raw: string): TwitterThreadTweet[] {
  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    return [];
  }

  const lines = trimmed.split(/\r?\n/);
  const tweets: TwitterThreadTweet[] = [];
  let currentIndex = 0;
  let currentLines: string[] = [];

  const flushTweet = () => {
    if (currentLines.length === 0) {
      return;
    }

    const content = currentLines.join("\n").trim();
    if (content.length > 0) {
      tweets.push({
        index: currentIndex,
        content,
        length: content.length,
      });
    }

    currentLines = [];
  };

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.length === 0) {
      if (currentLines.length > 0) {
        currentLines.push("");
      }
      continue;
    }

    if (TWEET_START_PATTERN.test(trimmedLine)) {
      flushTweet();
      const slashIndex = trimmedLine.indexOf("/");
      const indexPart = trimmedLine.slice(0, slashIndex);
      currentIndex = Number.parseInt(indexPart, 10) || tweets.length + 1;
      currentLines = [trimmedLine];
      continue;
    }

    if (currentLines.length > 0) {
      currentLines.push(trimmedLine);
    } else {
      currentLines = [trimmedLine];
      currentIndex = tweets.length + 1;
    }
  }

  flushTweet();
  return tweets;
}

/** Thread istatistiklerini ve limit ihlallerini döndürür. */
export function getTwitterThreadStats(
  raw: string,
  perTweetLimit: number = THREAD_PER_TWEET_LIMIT,
): TwitterThreadStats {
  const tweets = parseTwitterThread(raw);
  const totalLength = raw.trim().length;
  const maxTweetLength =
    tweets.length > 0 ? Math.max(...tweets.map((tweet) => tweet.length)) : 0;
  const violatingTweets = tweets.filter((tweet) => tweet.length > perTweetLimit);

  return {
    tweets,
    tweetCount: tweets.length,
    totalLength,
    maxTweetLength,
    violatingTweets,
  };
}
