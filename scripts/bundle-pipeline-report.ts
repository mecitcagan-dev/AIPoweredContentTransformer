/**
 * Bundle çıktı pipeline raporu (API anahtarı olmadan fixture + örnek paket).
 * Çalıştırma: npx --yes tsx scripts/bundle-pipeline-report.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { SAMPLE_ARTICLE } from "../lib/constants/sample-article";
import { PLATFORM_BY_ID, PLATFORM_IDS } from "../lib/constants/platforms";
import { normalizeSeoMeta } from "../lib/utils/normalize-seo-meta";
import { parseSeoMeta } from "../lib/utils/parse-seo-meta";
import { getTwitterThreadStats } from "../lib/utils/parse-twitter-thread";
import { getCharacterDisplayStats } from "../lib/utils/output-character-stats";

const ROOT = join(import.meta.dirname, "..");

function extractSection(markdown: string, heading: string): string {
  const pattern = new RegExp(`## ${heading}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`);
  const match = markdown.match(pattern);
  return match?.[1]?.trim() ?? "";
}

const sampleBundle = readFileSync(
  join(ROOT, "samples/04-bundle-package.md"),
  "utf8",
);

const seoTitleSample = extractSection(sampleBundle, "SEO Başlık");
const seoDescSample = extractSection(sampleBundle, "Meta Açıklama");
const linkedinSample = extractSection(sampleBundle, "LinkedIn Post");
const threadSample = extractSection(sampleBundle, "X Thread");
const instagramSample = extractSection(sampleBundle, "Instagram Caption");

const simulatedSeoRaw = `BAŞLIK: ${seoTitleSample}\nAÇIKLAMA: ${seoDescSample}`;
const seoParsed = parseSeoMeta(simulatedSeoRaw);
const seoNormalized = normalizeSeoMeta(seoParsed, simulatedSeoRaw);

const threadStats = getTwitterThreadStats(threadSample);
const threadDisplay = getCharacterDisplayStats({
  content: threadSample,
  title: "X Thread",
  platformId: PLATFORM_IDS.TWITTER_THREAD,
  characterLimit: PLATFORM_BY_ID[PLATFORM_IDS.TWITTER_THREAD].characterLimit,
  limitMode: "per_segment",
});

const linkedinLimit = PLATFORM_BY_ID[PLATFORM_IDS.LINKEDIN].characterLimit;
const instagramLimit = PLATFORM_BY_ID[PLATFORM_IDS.INSTAGRAM].characterLimit;

console.log("=== Bundle Pipeline Report (örnek makale / samples/04) ===\n");
console.log(`Kaynak makale: ${SAMPLE_ARTICLE.length} karakter (SAMPLE_ARTICLE)`);
console.log(
  "Canlı Groq bundle testi: GROQ_API_KEY yok — fixture + örnek paket simülasyonu\n",
);

console.log("--- SEO (simüle parse + normalize) ---");
console.log(`Başlık: ${seoNormalized.title.length}/60 — "${seoNormalized.title}"`);
console.log(
  `Meta Açıklama dolu: ${seoNormalized.description.trim().length > 0 ? "Evet" : "Hayır"} (${seoNormalized.description.length}/155)`,
);
if (seoNormalized.description.trim().length > 0) {
  console.log(`  "${seoNormalized.description.slice(0, 80)}..."`);
}

console.log("\n--- X Thread ---");
console.log(`Sayaç: ${threadDisplay.counterText}`);
console.log(`İkincil: ${threadDisplay.secondaryText}`);
console.log(`Limit uyarısı: ${threadDisplay.limitWarning ?? "Yok"}`);
console.log(`Tweet sayısı: ${threadStats.tweetCount}, max tweet: ${threadStats.maxTweetLength}`);

console.log("\n--- LinkedIn ---");
console.log(
  `${linkedinSample.length}/${linkedinLimit} — limit içi: ${linkedinSample.length <= linkedinLimit}`,
);

console.log("\n--- Instagram ---");
console.log(
  `${instagramSample.length}/${instagramLimit} — limit içi: ${instagramSample.length <= instagramLimit}`,
);

console.log("\nRapor tamamlandı.");
