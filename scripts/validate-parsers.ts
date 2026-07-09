/**
 * Parser ve normalize fixture doğrulaması (test runner yok — manuel/script).
 * Çalıştırma: npx --yes tsx scripts/validate-parsers.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { normalizeSeoMeta } from "../lib/utils/normalize-seo-meta";
import { parseSeoMeta } from "../lib/utils/parse-seo-meta";
import { getTwitterThreadStats } from "../lib/utils/parse-twitter-thread";
import { getCharacterDisplayStats } from "../lib/utils/output-character-stats";
import { PLATFORM_IDS } from "../lib/constants/platforms";

const ROOT = join(import.meta.dirname, "..");
const FIXTURES = join(ROOT, "lib/utils/__fixtures__");

function readFixture(...parts: string[]): string {
  return readFileSync(join(FIXTURES, ...parts), "utf8");
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

console.log("=== parseSeoMeta fixtures ===\n");

const titleOnly = readFixture("seo-meta", "title-only-193chars.txt");
const titleOnlyParsed = parseSeoMeta(titleOnly);
assert(titleOnlyParsed.title.length > 60, "title-only: title should be long");
assert(titleOnlyParsed.description === "", "title-only: description empty");
assert(
  titleOnlyParsed.warnings?.includes("Açıklama ayrıştırılamadı") === true,
  "title-only: parse warning",
);
const titleOnlyNormalized = normalizeSeoMeta(titleOnlyParsed, titleOnly);
assert(
  titleOnlyNormalized.title.length <= 60,
  `title-only normalized: ${titleOnlyNormalized.title.length} <= 60`,
);
console.log(`✓ title-only-193chars: normalized title ${titleOnlyNormalized.title.length} chars`);

const singleLine = readFixture("seo-meta", "single-line-both-fields.txt");
const singleLineParsed = parseSeoMeta(singleLine);
assert(singleLineParsed.title.length > 0, "single-line: title");
assert(singleLineParsed.description.length > 0, "single-line: description");
console.log("✓ single-line-both-fields: both fields parsed");

const lowercase = readFixture("seo-meta", "lowercase-prefixes.txt");
const lowercaseParsed = parseSeoMeta(lowercase);
assert(lowercaseParsed.title.length > 0, "lowercase: title");
assert(lowercaseParsed.description.length > 0, "lowercase: description");
console.log("✓ lowercase-prefixes: both fields parsed");

const multiline = readFixture("seo-meta", "multiline-description.txt");
const multilineParsed = parseSeoMeta(multiline);
assert(multilineParsed.description.includes("\n") || multilineParsed.description.length > 40, "multiline: description");
console.log("✓ multiline-description: description captured");

console.log("\n=== parseTwitterThread fixtures ===\n");

const validThread = readFixture("twitter-thread", "sample-valid-thread.txt");
const validStats = getTwitterThreadStats(validThread);
assert(validStats.tweetCount >= 3, "valid thread: tweet count");
assert(validStats.maxTweetLength <= 280, `valid thread max tweet: ${validStats.maxTweetLength}`);
const validDisplay = getCharacterDisplayStats({
  content: validThread,
  title: "X Thread",
  platformId: PLATFORM_IDS.TWITTER_THREAD,
  characterLimit: 280,
  limitMode: "per_segment",
});
assert(
  validDisplay.limitWarning === null,
  "valid thread: no limit warning on total length",
);
console.log(
  `✓ sample-valid-thread: ${validStats.tweetCount} tweets, max ${validStats.maxTweetLength}/280, total ${validStats.totalLength}`,
);
console.log(`  counter: ${validDisplay.counterText}`);
console.log(`  secondary: ${validDisplay.secondaryText}`);

const overlong = readFixture("twitter-thread", "overlong-tweet.txt");
const overlongStats = getTwitterThreadStats(overlong);
assert(overlongStats.violatingTweets.length > 0, "overlong: violation detected");
const overlongDisplay = getCharacterDisplayStats({
  content: overlong,
  title: "X Thread",
  platformId: PLATFORM_IDS.TWITTER_THREAD,
  characterLimit: 280,
  limitMode: "per_segment",
});
assert(overlongDisplay.limitWarning !== null, "overlong: limit warning");
console.log(`✓ overlong-tweet: ${overlongStats.violatingTweets.length} violating tweet(s)`);

console.log("\n=== streaming vs complete normalize guard ===\n");
const streamingPartial = "BAŞLIK: Uzaktan Çalışmada Verimlilik Artışı İçin Güven";
const streamingParsed = parseSeoMeta(streamingPartial);
assert(
  streamingParsed.title === streamingPartial.replace(/^BAŞLIK:\s*/i, "").trim(),
  "streaming: raw parse without normalize",
);
assert(
  normalizeSeoMeta(streamingParsed).title.length <= streamingParsed.title.length,
  "normalize only shortens or keeps",
);
console.log("✓ streaming partial: parse without premature truncate in hook path");

console.log("\nAll parser validations passed.");
