"use client";

import { Check, Copy, FileQuestion, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClipboard } from "@/lib/hooks/useClipboard";
import type { TransformState } from "@/lib/hooks/useTransform";
import { cn } from "@/lib/utils";

const LOADING_MESSAGES = [
  "İçerik analiz ediliyor...",
  "Platform formatına uyarlanıyor...",
  "Son dokunuşlar yapılıyor...",
] as const;

export interface OutputPanelProps {
  state: TransformState;
  output: string;
  error: string | null;
  platformLabel?: string;
  onRetry?: () => void;
  onCopySuccess?: () => void;
}

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

export function OutputPanel({
  state,
  output,
  error,
  platformLabel,
  onRetry,
  onCopySuccess,
}: OutputPanelProps) {
  const { copy, copied } = useClipboard();
  const prefersReducedMotion = usePrefersReducedMotion();
  const outputRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const isCopyDisabled =
    state === "idle" ||
    state === "loading" ||
    state === "streaming" ||
    state === "error" ||
    output.trim().length === 0;

  useEffect(() => {
    if (state === "streaming") {
      userScrolledRef.current = false;
    }
  }, [state]);

  useEffect(() => {
    if (state !== "loading") {
      setLoadingMessageIndex(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setLoadingMessageIndex((current) => (current + 1) % LOADING_MESSAGES.length);
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [state]);

  useEffect(() => {
    if (state !== "streaming" || userScrolledRef.current || !outputRef.current) {
      return;
    }

    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [output, state]);

  const handleOutputScroll = () => {
    const container = outputRef.current;
    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    userScrolledRef.current = distanceFromBottom > 48;
  };

  const handleCopy = async () => {
    if (isCopyDisabled) {
      return;
    }

    await copy(output);
    onCopySuccess?.();
  };

  return (
    <section className="flex h-full flex-col gap-3 bg-bg-surface p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-medium text-text-primary">Çıktı</h2>
          {platformLabel && (
            <Badge variant="secondary" aria-label={`Seçili platform: ${platformLabel}`}>
              {platformLabel}
            </Badge>
          )}
        </div>

        <p className="text-xs text-text-muted">
          {output.length} karakter
        </p>
      </div>

      <div
        ref={outputRef}
        onScroll={handleOutputScroll}
        className="min-h-[320px] flex-1 overflow-y-auto rounded-lg border border-border-default bg-bg-base p-4"
        aria-live={state === "streaming" ? "polite" : undefined}
        aria-busy={state === "loading" || state === "streaming"}
      >
        {state === "idle" && (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 text-center">
            <FileQuestion
              className="h-12 w-12 text-text-muted"
              aria-hidden="true"
            />
            <p className="text-sm text-text-muted">
              Platform seçip dönüştürün
            </p>
          </div>
        )}

        {state === "loading" && (
          <div className="space-y-3">
            <Skeleton
              className={cn(
                "h-4 w-full bg-bg-elevated",
                prefersReducedMotion ? "animate-none" : "animate-pulse",
              )}
            />
            <Skeleton
              className={cn(
                "h-4 w-11/12 bg-bg-elevated",
                prefersReducedMotion ? "animate-none" : "animate-pulse",
              )}
            />
            <Skeleton
              className={cn(
                "h-4 w-2/3 bg-bg-elevated",
                prefersReducedMotion ? "animate-none" : "animate-pulse",
              )}
            />
            <p className="pt-2 text-sm text-text-muted" role="status">
              {LOADING_MESSAGES[loadingMessageIndex]}
            </p>
          </div>
        )}

        {(state === "streaming" || state === "success") && (
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-text-primary">
            {output}
            {state === "streaming" && (
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

        {state === "error" && (
          <Alert variant="destructive" className="border-state-error/30 bg-state-error-bg">
            <AlertTitle className="text-state-error">Dönüşüm başarısız</AlertTitle>
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
                  aria-label="Tekrar dene"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Tekrar Dene
                </Button>
              </div>
            )}
          </Alert>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isCopyDisabled}
          onClick={handleCopy}
          aria-label="Çıktıyı panoya kopyala"
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          Kopyala
        </Button>
      </div>
    </section>
  );
}
