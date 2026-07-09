import type { BundleSectionId, Length, Tone } from "@/lib/ai/types";
import type { PlatformId } from "@/lib/constants/platforms";
import type { TransformState } from "@/lib/hooks/useTransform";

export type { BundleSectionId, Length, PlatformId, Tone, TransformState };

export type HealthCheckStatus = boolean | null;

export type TransformStep = "source" | "settings" | "result";

export type BundleSectionStatus =
  | "pending"
  | "streaming"
  | "complete"
  | "error";

export interface BundleSectionState {
  content: string;
  status: BundleSectionStatus;
}

export type BundleTransformState =
  | "idle"
  | "loading"
  | "streaming"
  | "success"
  | "error"
  | "partial_error";

export interface BundleOutput {
  sections: Record<BundleSectionId, BundleSectionState>;
  activeSection: BundleSectionId | null;
  seoTitle: string;
  seoDescription: string;
}
