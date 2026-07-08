import type { Length, Tone } from "@/lib/ai/types";
import type { PlatformId } from "@/lib/constants/platforms";
import type { TransformState } from "@/lib/hooks/useTransform";

export type { Length, PlatformId, Tone, TransformState };

export type HealthCheckStatus = boolean | null;

export type TransformStep = "source" | "settings" | "result";
