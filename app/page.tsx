"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { Header } from "@/components/layout/Header";
import { OnboardingDialog } from "@/components/layout/OnboardingDialog";
import { OutputPanel } from "@/components/transform/OutputPanel";
import { PlatformSelector } from "@/components/transform/PlatformSelector";
import { SourcePanel } from "@/components/transform/SourcePanel";
import { TransformButton } from "@/components/transform/TransformButton";
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
import type { TransformRequestInput } from "@/lib/validation/transform-schema";
import type { TransformStep } from "@/types/transform";

const MIN_SOURCE_LENGTH = 50;

/**
 * TransformStepper adım eşlemesi (ui-context.md User Journey sırasına dayanır):
 * kaynak girişi → platform/ayarlar hazırlığı → dönüşüm sonucu.
 * Dönüşüm başladığında veya tamamlandığında kullanıcı "Sonuç" adımındadır.
 */
function deriveCurrentStep(
  source: string,
  transformState: ReturnType<typeof useTransform>["state"],
): TransformStep {
  if (
    transformState === "loading" ||
    transformState === "streaming" ||
    transformState === "success" ||
    transformState === "error"
  ) {
    return "result";
  }

  if (source.trim().length < MIN_SOURCE_LENGTH) {
    return "source";
  }

  return "settings";
}

export default function HomePage() {
  const [source, setSource] = useState("");
  const [platform, setPlatform] = useState<PlatformId | null>(null);
  const [tone, setTone] = useState<Tone>(TONES.PROFESYONEL);
  const [audience, setAudience] = useState("");
  const [length, setLength] = useState<Length>(LENGTHS.ORTA);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { hasApiKey, setHasApiKey } = useHealthCheck();
  const { state, output, error, transform } = useTransform();

  const isTransforming = state === "loading" || state === "streaming";
  const isSourceValid = source.trim().length >= MIN_SOURCE_LENGTH;
  const isTransformDisabled = !platform || !isSourceValid || isTransforming;

  const currentStep = deriveCurrentStep(source, state);

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

  const handleTransform = useCallback(() => {
    if (!transformRequest) {
      return;
    }

    void transform(transformRequest);
  }, [transform, transformRequest]);

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

  const onboardingOpen = hasApiKey !== true || settingsOpen;
  const onboardingClosable = hasApiKey === true && settingsOpen;

  const outputPanelProps = {
    state,
    output,
    error,
    platformLabel,
    onRetry: handleRetry,
    onCopySuccess: handleCopySuccess,
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <Header onOpenSettings={() => setSettingsOpen(true)} />

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col">
        <div className="flex flex-col lg:grid lg:grid-cols-[45%_55%] lg:grid-rows-[1fr_auto]">
          <div className="order-1 border-b border-border-default lg:col-start-1 lg:row-start-1 lg:border-b-0 lg:border-r">
            <SourcePanel value={source} onChange={setSource} />
          </div>

          <div className="order-3 lg:order-2 lg:col-start-2 lg:row-start-1">
            <OutputPanel {...outputPanelProps} />
          </div>

          <div className="order-2 flex flex-col gap-4 border-b border-border-default py-4 lg:order-3 lg:col-span-2 lg:row-start-2 lg:border-t lg:border-b-0">
            <TransformStepper currentStep={currentStep} />
            <PlatformSelector
              selected={platform}
              onSelect={setPlatform}
              disabled={isTransforming}
            />
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
