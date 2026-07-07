# Code Standards

## General

- Modülleri küçük ve tek amaçlı tut; bir dosya bir sorumluluk
- Kök nedeni düzelt; workaround katmanları ekleme
- İlişkisiz concern'leri tek component veya route'ta birleştirme
- Tüm implementasyon SSOT context dosyalarına dayanır; belgelerde tanımsız davranış icat etme
- Public fonksiyonlarda tek satırlık JSDoc yaz

## TypeScript

- `strict: true` zorunlu; `any` kullanımı yasak
- Bilinmeyen dış girdi (API request, dosya içeriği) sistem sınırlarında validate edilmeden güvenilmez
- `unknown` + type guard veya Zod parse kullan
- Interface tercih et; type alias yalnızca union/utility için
- Enum yerine `as const` object + derived type kullan

```typescript
const PLATFORMS = {
  LINKEDIN: "linkedin",
  TWITTER: "twitter-thread",
} as const;

type PlatformId = (typeof PLATFORMS)[keyof typeof PLATFORMS];
```

## Next.js

- Varsayılan Server Component; `"use client"` yalnızca browser interaktivitesi gerektiğinde
- Route handler'lar tek sorumluluk: validate → orchestrate → respond
- `app/page.tsx` ince tutulur; UI logic `components/` altına taşınır
- API route'larda `NextResponse` ve streaming `ReadableStream` kullan
- `metadata` ve `layout.tsx` root seviyede tanımlanır
- Environment variable'lar yalnızca server-side okunur; `NEXT_PUBLIC_` prefix'i API key için kullanılmaz

## Styling

- CSS custom property token'ları kullan (`ui-context.md`); hardcoded hex yasak
- Tailwind utility class'ları tercih et; custom CSS yalnızca global token tanımları için (`globals.css`)
- Border radius ölçeği `ui-context.md` ile uyumlu: `rounded-md`, `rounded-lg`, `rounded-xl`
- Responsive breakpoint'ler `ui-context.md` tablosuna uy
- `cn()` utility (clsx + tailwind-merge) ile conditional class birleştirme

**shadcn/ui + Tailwind CSS 4 kurulum notu:** shadcn/ui CLI kurulumu (`npx shadcn@latest init`) bazı sürüm kombinasyonlarında Tailwind CSS 4 ile ekstra config adımı gerektirebilir. Scaffold sırasında init komutunun Tailwind 4 uyumluluğunu doğrulaması gerekir; gerekirse `components.json` içinde `tailwind.config` yolu, CSS variables ve `tailwind.css` import yolu manuel ayarlanabilir. Uyumsuzluk görülürse shadcn dokümantasyonundaki Tailwind v4 kurulum adımları izlenir.

## API Routes

### `/api/transform` (POST)

1. Request body'yi Zod ile parse et (`lib/validation/transform-schema.ts`)
2. Parse başarısızsa `400` + `{ error: "Türkçe mesaj" }`
3. `TransformOrchestrator` ile streaming başlat
4. SSE response döndür (`Content-Type: text/event-stream`)
5. Hata durumunda stream başlamadan önce JSON error; stream ortasında hata olursa SSE error event

### `/api/health` (GET)

1. `GROQ_API_KEY` varlığını kontrol et
2. Groq API'ye minimal test isteği (veya key format doğrulama)
3. `{ ok: true }` veya `{ ok: false, error: "..." }` döndür

### Genel kurallar

- Tutarlı response shape: JSON hatalar `{ error: string }`
- HTTP status kodları doğru kullan: 400 (validasyon), 429 (rate limit), 500 (sunucu)
- Auth/ownership kontrolü yok (lokal uygulama)
- Request handler'da inline prompt yazma; `lib/ai/prompts/` kullan

## Data and Storage

- MVP'de veritabanı yok; state React'te, geçmiş V2'de localStorage
- Büyük içerik (kaynak metin) doğrudan state'te tutulur; max 8000 karakter
- API key `.env.local`'de; kod içinde veya client'ta hardcode etme
- localStorage key prefix: `repack_` (V2)

## Error Handling

- Server: try/catch ile Groq hatalarını yakala; kullanıcıya Türkçe mesaj döndür
- Client: `useTransform` hook'u error state yönetir; UI `ui-context.md` Error UX tablosuna uyar
- Console.error ile loglama (production monitoring yok)
- Ön-istek retry logic `lib/utils/retry.ts` içinde merkezi (yalnızca stream başlamadan önceki Groq bağlantı hataları; stream-ortası hatalar retry edilmez — bkz. `ai-workflow-rules.md`)
- Stream iptali: `useTransform` hook'u aktif `AbortController` referansı tutar; yeni dönüştürme isteği başladığında önceki controller `abort()` edilir, kısmi çıktı state'i sıfırlanır

## Import Order

```typescript
// 1. React / Next.js
import { useState } from "react";

// 2. Third-party
import { z } from "zod";

// 3. @/lib
import { PLATFORMS } from "@/lib/constants/platforms";

// 4. @/components
import { Button } from "@/components/ui/button";

// 5. Relative
import { SourcePanel } from "./SourcePanel";
```

## File Organization

| Klasör / dosya              | İçerik                                           |
| --------------------------- | ------------------------------------------------ |
| `app/`                      | Route'lar, layout, API handler'lar (ince)          |
| `components/ui/`            | shadcn bileşenleri (dokunulmaz)                   |
| `components/transform/`     | Dönüşüm ekranı bileşenleri                        |
| `components/layout/`        | Header, OnboardingDialog                          |
| `lib/ai/`                   | Provider, orchestrator, prompt engine, prompts    |
| `lib/validation/`           | Zod şemaları                                      |
| `lib/constants/`            | Platform metadata, örnek makale                   |
| `lib/hooks/`                | Client hook'lar                                   |
| `lib/utils/`                | Ön-istek retry (`retry.ts`), SSE parse (`sse.ts`), cn() |
| `lib/hooks/useTransform.ts` | SSE tüketimi, AbortController ile stream iptali   |
| `types/`                    | Paylaşılan TypeScript tipleri                     |

## Naming Conventions

| Tür                | Convention          | Örnek                        |
| ------------------ | ------------------- | ---------------------------- |
| React component    | PascalCase          | `SourcePanel.tsx`            |
| Hook               | camelCase, `use`    | `useTransform.ts`            |
| Utility function   | camelCase           | `buildUserPrompt()`          |
| Constant           | UPPER_SNAKE_CASE    | `MAX_SOURCE_LENGTH`          |
| Type / Interface   | PascalCase          | `TransformRequest`           |
| API route          | kebab-case (folder) | `api/transform/route.ts`     |
| CSS variable       | kebab-case          | `--bg-base`                  |
| Prompt file        | kebab-case          | `twitter-thread.ts`          |

## Component Guidelines

- Props interface'i component ile aynı dosyada, `ComponentNameProps` adıyla
- Event handler'lar: `handle` prefix (`handleTransform`, `handleCopy`)
- Conditional rendering: erken return yerine explicit state switch (loading, error, empty, success)
- shadcn bileşenlerini doğrudan düzenleme; wrapper veya className ile özelleştir

## Testing Conventions (V2)

MVP'de otomatik test zorunlu değil. V2'de eklenecekse:

- Unit test: `lib/ai/prompt-engine.ts`, `lib/validation/`
- Integration test: `/api/transform` mock Groq ile
- E2E: Playwright ile temel akış

## Related Documents

- Mimari ve invariant'lar: `architecture.md`
- AI prompt kuralları: `ai-workflow-rules.md`
- Tasarım token'ları: `ui-context.md`
- Geliştirme durumu: `progress-tracker.md`
