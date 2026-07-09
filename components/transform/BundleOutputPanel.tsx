"use client";

import {
  Check,
  Copy,
  Download,
  FileQuestion,
  RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { BundleProgressBar } from "@/components/transform/BundleProgressBar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PLATFORM_BY_ID, PLATFORM_IDS } from "@/lib/constants/platforms";
import { useClipboard } from "@/lib/hooks/useClipboard";
import {
  SEO_DESCRIPTION_MAX,
  SEO_TITLE_MAX,
} from "@/lib/utils/normalize-seo-meta";
import {
  getCharacterDisplayStats,
  getCounterToneClassName,
} from "@/lib/utils/output-character-stats";
import { parseSeoMeta } from "@/lib/utils/parse-seo-meta";
import { cn } from "@/lib/utils";
import type {
  BundleOutput,
  BundleSectionStatus,
  BundleTransformState,
} from "@/types/transform";

function formatBundleMarkdown(output: BundleOutput): string {
  return [
    "## SEO Başlık",
    output.seoTitle,
    "",
    "## Meta Açıklama",
    output.seoDescription,
    "",
    "## LinkedIn",
    output.sections.linkedin.content,
    "",
    "## X Thread",
    output.sections["twitter-thread"].content,
    "",
    "## Instagram",
    output.sections.instagram.content,
    "",
  ].join("\n");
}

function downloadBundleMarkdown(output: BundleOutput): void {
  const content = formatBundleMarkdown(output);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `repack-bundle-${date}.md`;
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export interface BundleOutputPanelProps {
  bundleState: BundleTransformState;
  bundleOutput: BundleOutput;
  error: string | null;
  onRetry?: () => void;
  onCopySuccess?: () => void;
}

interface BundleCardConfig {
  id: string;
  title: string;
  getContent: (output: BundleOutput) => string;
  getStatus: (output: BundleOutput) => BundleSectionStatus;
  characterLimit?: number;
  platformId?: (typeof PLATFORM_IDS)[keyof typeof PLATFORM_IDS];
  getParseWarning?: (output: BundleOutput) => string | null;
}

const BUNDLE_CARDS: BundleCardConfig[] = [
  {
    id: "seo-title",
    title: "SEO Başlık",
    getContent: (output) => {
      const section = output.sections["seo-meta"];
      if (section.status === "complete") {
        return output.seoTitle;
      }
      return parseSeoMeta(section.content).title;
    },
    getStatus: (output) => output.sections["seo-meta"].status,
    characterLimit: SEO_TITLE_MAX,
  },
  {
    id: "seo-description",
    title: "Meta Açıklama",
    getContent: (output) => {
      const section = output.sections["seo-meta"];
      if (section.status === "complete") {
        return output.seoDescription;
      }
      return parseSeoMeta(section.content).description;
    },
    getStatus: (output) => output.sections["seo-meta"].status,
    characterLimit: SEO_DESCRIPTION_MAX,
    getParseWarning: (output) => {
      const section = output.sections["seo-meta"];
      if (section.status !== "complete") {
        return null;
      }

      if (output.seoDescription.trim().length > 0) {
        return null;
      }

      return "Açıklama ayrıştırılamadı";
    },
  },
  {
    id: "linkedin",
    title: "LinkedIn Post",
    getContent: (output) => output.sections.linkedin.content,
    getStatus: (output) => output.sections.linkedin.status,
    characterLimit: PLATFORM_BY_ID[PLATFORM_IDS.LINKEDIN].characterLimit,
    platformId: PLATFORM_IDS.LINKEDIN,
  },
  {
    id: "twitter-thread",
    title: "X Thread",
    getContent: (output) => output.sections["twitter-thread"].content,
    getStatus: (output) => output.sections["twitter-thread"].status,
    characterLimit: PLATFORM_BY_ID[PLATFORM_IDS.TWITTER_THREAD].characterLimit,
    platformId: PLATFORM_IDS.TWITTER_THREAD,
  },
  {
    id: "instagram",
    title: "Instagram Caption",
    getContent: (output) => output.sections.instagram.content,
    getStatus: (output) => output.sections.instagram.status,
    characterLimit: PLATFORM_BY_ID[PLATFORM_IDS.INSTAGRAM].characterLimit,
    platformId: PLATFORM_IDS.INSTAGRAM,
  },
];

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

interface BundleOutputCardProps {
  title: string;
  content: string;
  status: BundleSectionStatus;
  characterLimit?: number;
  platformId?: (typeof PLATFORM_IDS)[keyof typeof PLATFORM_IDS];
  parseWarning?: string | null;
  isGlobalLoading: boolean;
  isGlobalIdle: boolean;
  isActive: boolean;
  showNotProduced: boolean;
  errorMessage?: string | null;
  prefersReducedMotion: boolean;
  onCopySuccess?: () => void;
}

function BundleOutputCard({
  title,
  content,
  status,
  characterLimit,
  platformId,
  parseWarning,
  isGlobalLoading,
  isGlobalIdle,
  isActive,
  showNotProduced,
  errorMessage,
  prefersReducedMotion,
  onCopySuccess,
}: BundleOutputCardProps) {
  const { copy, copied } = useClipboard();

  const isCopyDisabled =
    content.trim().length === 0 ||
    status === "pending" ||
    status === "streaming" ||
    isGlobalLoading ||
    isGlobalIdle;

  const handleCopy = async () => {
    if (isCopyDisabled) {
      return;
    }

    await copy(content);
    onCopySuccess?.();
  };

  const displayStats = getCharacterDisplayStats({
    content,
    title,
    platformId,
    characterLimit,
    limitMode:
      platformId === PLATFORM_IDS.TWITTER_THREAD ? "per_segment" : "total",
  });

  return (
    <Card
      className={cn(
        "border-border-default bg-bg-base",
        isActive && "border-accent-primary",
        status === "complete" && !isActive && "border-border-default",
        status === "error" && "border-state-error/40",
      )}
      aria-busy={status === "streaming" || isGlobalLoading}
    >
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium text-text-primary">
            {title}
          </CardTitle>
          {status === "complete" && (
            <Check
              className="h-4 w-4 text-state-success"
              aria-label="Tamamlandı"
            />
          )}
          {status === "streaming" && (
            <Badge variant="secondary" aria-label="Üretiliyor">
              Üretiliyor
            </Badge>
          )}
        </div>
        <div className="text-right">
          <p
            className={cn(
              "text-xs",
              getCounterToneClassName(displayStats.counterTone),
            )}
          >
            {displayStats.counterText}
          </p>
          {displayStats.secondaryText && (
            <p className="text-xs text-text-muted">{displayStats.secondaryText}</p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {displayStats.limitWarning && (
          <p className="text-xs text-state-warning" role="status">
            {displayStats.limitWarning}
          </p>
        )}

        {parseWarning && (
          <p className="text-xs text-state-error" role="status">
            {parseWarning}
          </p>
        )}

        {isGlobalLoading && (
          <div className="space-y-2">
            <Skeleton
              className={cn(
                "h-4 w-full bg-bg-elevated",
                prefersReducedMotion ? "animate-none" : "animate-pulse",
              )}
            />
            <Skeleton
              className={cn(
                "h-4 w-4/5 bg-bg-elevated",
                prefersReducedMotion ? "animate-none" : "animate-pulse",
              )}
            />
          </div>
        )}

        {!isGlobalLoading && isGlobalIdle && (
          <p className="text-sm text-text-muted">Henüz üretilmedi</p>
        )}

        {!isGlobalLoading && !isGlobalIdle && status === "pending" && (
          <p className="text-sm text-text-muted">
            {showNotProduced ? "Üretilmedi" : "Bekleniyor..."}
          </p>
        )}

        {!isGlobalLoading &&
          !isGlobalIdle &&
          (status === "streaming" || status === "complete") && (
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-text-primary">
              {content}
              {status === "streaming" && (
                <span
                  className={cn(
                    "text-accent-primary",
                    !prefersReducedMotion && "animate-pulse",
                  )}
                  aria-hidden="true"
                >
                  |
                </span>
              )}
            </p>
          )}

        {!isGlobalLoading && !isGlobalIdle && status === "error" && (
          <div className="space-y-3">
            {content.trim().length > 0 && (
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-text-primary">
                {content}
              </p>
            )}
            <Alert
              variant="destructive"
              className="border-state-error/30 bg-state-error-bg"
            >
              <AlertTitle className="text-state-error">Üretim başarısız</AlertTitle>
              <AlertDescription className="text-state-error">
                {errorMessage ??
                  "Bu bölüm üretilirken bir hata oluştu."}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isCopyDisabled}
            onClick={handleCopy}
            aria-label={`${title} içeriğini panoya kopyala`}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            Kopyala
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function BundleOutputPanel({
  bundleState,
  bundleOutput,
  error,
  onRetry,
  onCopySuccess,
}: BundleOutputPanelProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);

  const isGlobalIdle = bundleState === "idle";
  const isGlobalLoading = bundleState === "loading";
  const showGlobalError =
    bundleState === "error" ||
    (bundleState === "partial_error" && error !== null);

  useEffect(() => {
    if (bundleState === "streaming") {
      userScrolledRef.current = false;
    }
  }, [bundleState]);

  useEffect(() => {
    if (
      bundleState !== "streaming" ||
      userScrolledRef.current ||
      !panelRef.current ||
      !bundleOutput.activeSection
    ) {
      return;
    }

    const activeCard = panelRef.current.querySelector(
      `[data-active-section="true"]`,
    );

    activeCard?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [bundleOutput, bundleState]);

  const handlePanelScroll = () => {
    const container = panelRef.current;
    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    userScrolledRef.current = distanceFromBottom > 48;
  };

  return (
    <section className="flex h-full flex-col gap-3 bg-bg-surface p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-text-primary">
          Paket Çıktısı
        </h2>
        <Badge variant="secondary" aria-label="SEO + Sosyal Medya Paketi">
          SEO + Sosyal Medya Paketi
        </Badge>
      </div>

      <BundleProgressBar
        bundleOutput={bundleOutput}
        bundleState={bundleState}
      />

      <div
        ref={panelRef}
        onScroll={handlePanelScroll}
        className="min-h-[320px] flex-1 space-y-3 overflow-y-auto rounded-lg border border-border-default bg-bg-base p-3"
        aria-live={bundleState === "streaming" ? "polite" : undefined}
        aria-busy={isGlobalLoading || bundleState === "streaming"}
      >
        {isGlobalIdle ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 py-6 text-center">
            <FileQuestion
              className="h-12 w-12 text-text-muted"
              aria-hidden="true"
            />
            <p className="text-sm text-text-muted">
              Kaynak metin girip paketi dönüştürün
            </p>
          </div>
        ) : (
          BUNDLE_CARDS.map((card) => {
            const status = card.getStatus(bundleOutput);
            const content = card.getContent(bundleOutput);
            const parseWarning = card.getParseWarning?.(bundleOutput) ?? null;
            const isActive =
              bundleOutput.activeSection !== null &&
              ((card.id.startsWith("seo-") &&
                bundleOutput.activeSection === "seo-meta") ||
                card.id === bundleOutput.activeSection);

            const showNotProduced =
              bundleState === "partial_error" && status === "pending";

            return (
              <div
                key={card.id}
                data-active-section={isActive ? "true" : undefined}
              >
                <BundleOutputCard
                  title={card.title}
                  content={content}
                  status={status}
                  characterLimit={card.characterLimit}
                  platformId={card.platformId}
                  parseWarning={parseWarning}
                  isGlobalLoading={isGlobalLoading}
                  isGlobalIdle={isGlobalIdle}
                  isActive={isActive}
                  showNotProduced={showNotProduced}
                  errorMessage={status === "error" ? error : null}
                  prefersReducedMotion={prefersReducedMotion}
                  onCopySuccess={onCopySuccess}
                />
              </div>
            );
          })
        )}
      </div>

      {bundleState === "success" && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => downloadBundleMarkdown(bundleOutput)}
          aria-label="Paketi Markdown dosyası olarak indir"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Paketi İndir (.md)
        </Button>
      )}

      {showGlobalError && (
        <Alert
          variant="destructive"
          className="border-state-error/30 bg-state-error-bg"
        >
          <AlertTitle className="text-state-error">
            {bundleState === "partial_error"
              ? "Paket kısmen üretildi"
              : "Paket üretimi başarısız"}
          </AlertTitle>
          <AlertDescription className="text-state-error">
            {error ?? "Bir hata oluştu. Lütfen tekrar deneyin."}
          </AlertDescription>
          {onRetry && (
            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
                aria-label="Paketi tekrar dene"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Tekrar Dene
              </Button>
            </div>
          )}
        </Alert>
      )}
    </section>
  );
}
