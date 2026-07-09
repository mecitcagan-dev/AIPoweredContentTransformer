"use client";

import { Check, Loader2, X } from "lucide-react";

import { BUNDLE_SECTIONS, type BundleSectionId } from "@/lib/ai/types";
import type { BundleOutput, BundleTransformState } from "@/types/transform";
import { cn } from "@/lib/utils";

const STAGE_LABELS: Record<BundleSectionId, string> = {
  "seo-meta": "SEO",
  linkedin: "LinkedIn",
  "twitter-thread": "X",
  instagram: "Instagram",
};

type StageStatus = "pending" | "streaming" | "complete" | "error";

export interface BundleProgressBarProps {
  bundleOutput: BundleOutput;
  bundleState: BundleTransformState;
}

function getStageStatus(
  sectionId: BundleSectionId,
  bundleOutput: BundleOutput,
  bundleState: BundleTransformState,
): StageStatus {
  const sectionStatus = bundleOutput.sections[sectionId].status;

  if (sectionStatus === "complete") {
    return "complete";
  }

  if (sectionStatus === "error") {
    return "error";
  }

  if (sectionStatus === "streaming") {
    return "streaming";
  }

  if (bundleState === "loading" && sectionId === BUNDLE_SECTIONS[0]) {
    return "streaming";
  }

  return "pending";
}

function StageIndicator({ status }: { status: StageStatus }) {
  if (status === "complete") {
    return (
      <Check
        className="h-4 w-4 text-state-success"
        aria-hidden="true"
      />
    );
  }

  if (status === "error") {
    return <X className="h-4 w-4 text-state-error" aria-hidden="true" />;
  }

  if (status === "streaming") {
    return (
      <Loader2
        className="h-4 w-4 animate-spin text-accent-primary"
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className="h-2.5 w-2.5 rounded-full bg-border-default"
      aria-hidden="true"
    />
  );
}

export function BundleProgressBar({
  bundleOutput,
  bundleState,
}: BundleProgressBarProps) {
  return (
    <nav
      aria-label="Paket üretim ilerlemesi"
      className="flex items-center justify-between gap-2 rounded-lg border border-border-default bg-bg-base px-3 py-2"
    >
      {BUNDLE_SECTIONS.map((sectionId, index) => {
        const status = getStageStatus(sectionId, bundleOutput, bundleState);
        const label = STAGE_LABELS[sectionId];

        return (
          <div key={sectionId} className="flex min-w-0 flex-1 items-center">
            <div className="flex min-w-0 flex-col items-center gap-1">
              <StageIndicator status={status} />
              <span
                className={cn(
                  "truncate text-xs",
                  status === "streaming"
                    ? "font-medium text-accent-primary"
                    : status === "complete"
                      ? "text-state-success"
                      : status === "error"
                        ? "text-state-error"
                        : "text-text-muted",
                )}
              >
                {label}
              </span>
            </div>

            {index < BUNDLE_SECTIONS.length - 1 && (
              <div
                className="mx-2 h-px flex-1 bg-border-default"
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
