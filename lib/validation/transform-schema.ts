import { z } from "zod";

import { LENGTHS, TONES } from "@/lib/ai/types";
import { PLATFORM_IDS, type PlatformId } from "@/lib/constants/platforms";

const platformIdValues = Object.values(PLATFORM_IDS) as [
  PlatformId,
  ...PlatformId[],
];

const toneValues = Object.values(TONES) as [
  (typeof TONES)[keyof typeof TONES],
  ...(typeof TONES)[keyof typeof TONES][],
];

const lengthValues = Object.values(LENGTHS) as [
  (typeof LENGTHS)[keyof typeof LENGTHS],
  ...(typeof LENGTHS)[keyof typeof LENGTHS][],
];

export const transformRequestSchema = z.object({
  source: z
    .string({ message: "Kaynak metin gereklidir" })
    .min(50, "Kaynak metin en az 50 karakter olmalıdır")
    .max(8000, "Kaynak metin en fazla 8000 karakter olabilir"),
  platform: z.enum(platformIdValues, {
    message: "Geçerli bir platform seçin",
  }),
  tone: z.enum(toneValues, {
    message: "Geçerli bir ton seçin",
  }),
  audience: z.string().optional(),
  length: z.enum(lengthValues, {
    message: "Geçerli bir uzunluk seçin",
  }),
});

export type TransformRequestInput = z.infer<typeof transformRequestSchema>;
