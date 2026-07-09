"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppFooter } from "@/components/layout/AppFooter";
import { Header } from "@/components/layout/Header";
import { BundleOutputPanel } from "@/components/transform/BundleOutputPanel";
import { OutputPanel } from "@/components/transform/OutputPanel";
import { PlatformSelector } from "@/components/transform/PlatformSelector";
import { SourcePanel } from "@/components/transform/SourcePanel";
import { TransformButton } from "@/components/transform/TransformButton";
import {
  TransformModeSelector,
  type TransformMode,
} from "@/components/transform/TransformModeSelector";
import { TransformSettings } from "@/components/transform/TransformSettings";
import { TransformStepper } from "@/components/transform/TransformStepper";
import { Toaster } from "@/components/ui/sonner";
import { LENGTHS, TONES, type Length, type Tone } from "@/lib/ai/types";
import {
  getPlatformById,
  type PlatformId,
} from "@/lib/constants/platforms";
import { useHealthCheck } from "@/lib/hooks/useHealthCheck";
import { useTransform } from "@/lib/hooks/useTransform";
import { useTransformBundle } from "@/lib/hooks/useTransformBundle";
import type { TransformState } from "@/lib/hooks/useTransform";
import type {
  TransformBundleRequestInput,
  TransformRequestInput,
} from "@/lib/validation/transform-schema";
import type {
  BundleTransformState,
  TransformStep,
} from "@/types/transform";

const OnboardingDialog = dynamic(
  () =>
    import("@/components/layout/OnboardingDialog").then(
      (mod) => mod.OnboardingDialog,
    ),
  { ssr: false },
);

const MIN_SOURCE_LENGTH = 50;

/**
 * TransformStepper adım eşlemesi (ui-context.md User Journey sırasına dayanır):
 * kaynak girişi → ayarlar/paket hazırlığı → dönüşüm sonucu.
 * Dönüşüm başladığında veya tamamlandığında kullanıcı "Sonuç" adımındadır.
 */
function deriveCurrentStep(
  source: string,
  mode: TransformMode,
  singleState: TransformState,
  bundleState: BundleTransformState,
): TransformStep {
  const isResultState =
    mode === "bundle"
      ? bundleState === "loading" ||
        bundleState === "streaming" ||
        bundleState === "success" ||
        bundleState === "error" ||
        bundleState === "partial_error"
      : singleState === "loading" ||
        singleState === "streaming" ||
        singleState === "success" ||
        singleState === "error";

  if (isResultState) {
    return "result";
  }

  if (source.trim().length < MIN_SOURCE_LENGTH) {
    return "source";
  }

  return "settings";
}

export default function HomePage() {
  const [mode, setMode] = useState<TransformMode>("bundle");
  const [source, setSource] = useState("");
  const [platform, setPlatform] = useState<PlatformId | null>(null);
  const [tone, setTone] = useState<Tone>(TONES.PROFESYONEL);
  const [audience, setAudience] = useState("");
  const [length, setLength] = useState<Length>(LENGTHS.ORTA);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { hasApiKey, setHasApiKey } = useHealthCheck();
  const {
    state: singleState,
    output,
    error: singleError,
    transform,
    reset: resetSingle,
  } = useTransform();
  const {
    bundleOutput,
    bundleState,
    error: bundleError,
    transformBundle,
    resetBundle,
  } = useTransformBundle();

  const isSingleTransforming =
    singleState === "loading" || singleState === "streaming";
  const isBundleTransforming =
    bundleState === "loading" || bundleState === "streaming";
  const isTransforming =
    mode === "bundle" ? isBundleTransforming : isSingleTransforming;

  const isSourceValid = source.trim().length >= MIN_SOURCE_LENGTH;
  const isSingleTransformDisabled =
    !platform || !isSourceValid || isSingleTransforming;
  const isBundleTransformDisabled = !isSourceValid || isBundleTransforming;
  const isTransformDisabled =
    mode === "bundle" ? isBundleTransformDisabled : isSingleTransformDisabled;

  const currentStep = deriveCurrentStep(
    source,
    mode,
    singleState,
    bundleState,
  );

  const platformLabel = useMemo(() => {
    if (!platform) {
      return undefined;
    }

    return getPlatformById(platform).label;
  }, [platform]);

  const transformRequest = useMemo((): TransformRequestInput | null => {
    if (!platform || !isSourceValid) {
      return null;
    }

    const trimmedAudience = audience.trim();

    return {
      source,
      platform,
      tone,
      audience: trimmedAudience.length > 0 ? trimmedAudience : undefined,
      length,
    };
  }, [audience, isSourceValid, length, platform, source, tone]);

  const bundleRequest = useMemo((): TransformBundleRequestInput | null => {
    if (!isSourceValid) {
      return null;
    }

    const trimmedAudience = audience.trim();

    return {
      source,
      tone,
      audience: trimmedAudience.length > 0 ? trimmedAudience : undefined,
      length,
    };
  }, [audience, isSourceValid, length, source, tone]);

  const handleTransform = useCallback(() => {
    if (mode === "bundle") {
      if (!bundleRequest) {
        return;
      }

      void transformBundle(bundleRequest);
      return;
    }

    if (!transformRequest) {
      return;
    }

    void transform(transformRequest);
  }, [bundleRequest, mode, transform, transformBundle, transformRequest]);

  const handleRetry = useCallback(() => {
    handleTransform();
  }, [handleTransform]);

  const handleCopySuccess = useCallback(() => {
    toast.success("Panoya kopyalandı", { duration: 2000 });
  }, []);

  const handleHealthSuccess = useCallback(() => {
    setHasApiKey(true);
    setSettingsOpen(false);
  }, [setHasApiKey]);

  const handleOnboardingOpenChange = useCallback(
    (open: boolean) => {
      if (hasApiKey !== true) {
        return;
      }

      setSettingsOpen(open);
    },
    [hasApiKey],
  );

  const handleModeChange = useCallback(
    (nextMode: TransformMode) => {
      if (nextMode === mode) {
        return;
      }

      resetSingle();
      resetBundle();
      setMode(nextMode);
    },
    [mode, resetBundle, resetSingle],
  );

  const onboardingOpen = hasApiKey !== true || settingsOpen;
  const onboardingClosable = hasApiKey === true && settingsOpen;

  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <Header onOpenSettings={() => setSettingsOpen(true)} />

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col">
        <div className="flex flex-col lg:grid lg:grid-cols-[45%_55%] lg:grid-rows-[1fr_auto]">
          <div className="order-1 border-b border-border-default lg:col-start-1 lg:row-start-1 lg:border-b-0 lg:border-r">
            <SourcePanel value={source} onChange={setSource} />
          </div>

          <div className="order-3 lg:order-2 lg:col-start-2 lg:row-start-1">
            {mode === "bundle" ? (
              <BundleOutputPanel
                bundleState={bundleState}
                bundleOutput={bundleOutput}
                error={bundleError}
                onRetry={handleRetry}
                onCopySuccess={handleCopySuccess}
              />
            ) : (
              <OutputPanel
                state={singleState}
                output={output}
                error={singleError}
                platformLabel={platformLabel}
                platformId={platform ?? undefined}
                onRetry={handleRetry}
                onCopySuccess={handleCopySuccess}
              />
            )}
          </div>

          <div className="order-2 flex flex-col gap-4 border-b border-border-default py-4 lg:order-3 lg:col-span-2 lg:row-start-2 lg:border-t lg:border-b-0">
            <TransformModeSelector
              mode={mode}
              onModeChange={handleModeChange}
              disabled={isTransforming}
            />
            <TransformStepper currentStep={currentStep} mode={mode} />
            {mode === "single" && (
              <PlatformSelector
                selected={platform}
                onSelect={setPlatform}
                disabled={isSingleTransforming}
              />
            )}
            <TransformSettings
              tone={tone}
              onToneChange={setTone}
              audience={audience}
              onAudienceChange={setAudience}
              length={length}
              onLengthChange={setLength}
            />
            <TransformButton
              onClick={handleTransform}
              disabled={isTransformDisabled}
              isLoading={isTransforming}
            />
          </div>
        </div>
      </main>

      <AppFooter />

      <OnboardingDialog
        open={onboardingOpen}
        onOpenChange={handleOnboardingOpenChange}
        closable={onboardingClosable}
        onSuccess={handleHealthSuccess}
      />

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
