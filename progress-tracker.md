# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Implementation Started (Scaffold + Tema)

## Current Goal

- README.md + `docs/prompt-explanation.md` + `samples/` (3 örnek çıktı)

## Completed

- Ürün keşfi ve staj görevi analizi
- Rakip araştırması (Jasper, Copy.ai, Buffer, Writesonic, HubSpot)
- UX planı: user journey, state matrix, layout, a11y
- Teknik mimari kararları ve AI provider abstraction tasarımı
- 8 MVP platform için tam prompt şablonları
- Tasarım sistemi token'ları ve component kuralları
- SSOT dokümantasyonu (6 context dosyası) tamamlandı
- SSOT dokümantasyon düzeltmeleri: groq-sdk paket adı, stream iptali, retry ayrımı, health check restart UX, örnek makale spec
- Next.js 15.5.20 scaffold (`create-next-app` + TypeScript + Tailwind CSS 4 + App Router + Turbopack)
- `architecture.md` dosya iskeleti (placeholder dosyalar + boş `app/api/` klasörleri)
- shadcn/ui init (Tailwind v4 uyumlu) + `globals.css` Repack tasarım token'ları (`ui-context.md`)
- Geist Sans + Geist Mono font kurulumu (`next/font/google`, `--font-sans` / `--font-mono`)
- `npm run build` ve `npm run dev` doğrulandı
- `lib/constants/platforms.ts` — 8 MVP platform metadata tek kaynağı (`PlatformId`, `PLATFORMS`, `PLATFORM_BY_ID`)
- `lib/ai/prompts/` — `SYSTEM_PROMPT` + 8 platform prompt dosyası + `PLATFORM_PROMPTS` lookup (`ai-workflow-rules.md` birebir)
- `lib/ai/types.ts` — `TransformRequest`, `AIProvider`, `Tone`, `Length` (`as const` + derived type)
- `lib/ai/prompt-engine.ts` — `buildUserPrompt()`, `buildMessages()` (template ve eşlemeler birebir)
- `lib/ai/` tamamlandı — `GroqProvider`, `createProvider()`, `TransformOrchestrator`, `lib/utils/retry.ts` (`groq-sdk`, ön-istek retry ayrımı)
- `lib/validation/transform-schema.ts` — `transformRequestSchema` + `TransformRequestInput` (Türkçe hata mesajları, `PLATFORM_IDS`/`TONES`/`LENGTHS` tek kaynak)
- `app/api/health/route.ts` — GET health check (`validateConfig()`, Türkçe hata mesajları, key sızmaz)
- `app/api/transform/route.ts` + `lib/utils/sse.ts` — POST SSE streaming (validate → orchestrate → stream; ön-istek JSON hata, stream-ortası SSE error event)
- `lib/hooks/useTransform.ts` + `useClipboard.ts` — SSE tüketimi, AbortController stream iptali, panoya kopyalama
- `components/layout/Header.tsx` + `OnboardingDialog.tsx` — üst bar, FTUE dialog, health check test akışı
- `lib/constants/sample-article.ts` — built-in örnek makale (Türkçe, 581 karakter, uzaktan çalışma konusu)
- `components/transform/SourcePanel.tsx` + `OutputPanel.tsx` — kaynak/çıktı panelleri (UX state matrix, a11y, Türkçe)
- `components/transform/` tamamlandı — PlatformSelector, TransformSettings, TransformButton, TransformStepper (+ shadcn collapsible, input, label)
- `app/page.tsx` — ana ekran birleştirme (`useHealthCheck`, tüm transform component'leri, FTUE OnboardingDialog, Sonner toast)

## In Progress

- None.

## Next Up

Implementation sırası (her adım uçtan uca doğrulanır):

1. README.md + `docs/prompt-explanation.md` + `samples/` (3 örnek çıktı)
2. Demo hazırlığı ve `npm run build` doğrulama

## Open Questions

- None. Tüm planlama kararları verildi ve context dosyalarına işlendi.

## Architecture Decisions

| ID   | Karar | Gerekçe | Tarih |
| ---- | ----- | ------- | ----- |
| ADR-001 | Next.js 15 + TypeScript + App Router | Streaming SSE, API routes ile güvenli Groq key, profesyonel UX | 2026-07-08 |
| ADR-002 | Groq API (`llama-3.3-70b-versatile`) v1 tek sağlayıcı | Staj sheet önerisi, ücretsiz tier, hızlı inference | 2026-07-08 |
| ADR-003 | AI Provider interface + factory pattern | OpenAI, Gemini, Claude ileride minimum değişiklikle eklenebilir | 2026-07-08 |
| ADR-004 | SSE streaming zorunlu | UX önceliği; boş bekleme yerine token-by-token çıktı | 2026-07-08 |
| ADR-005 | Dark-first tema, shadcn/ui + Tailwind CSS 4 | Profesyonel workspace hissi, hızlı component geliştirme | 2026-07-08 |
| ADR-006 | Türkçe arayüz | Staj sorumlusu ve demo hedef kitlesi Türkçe | 2026-07-08 |
| ADR-007 | Auth/DB yok, lokal-only | Proje kapsamı; Just Enough Architecture | 2026-07-08 |
| ADR-008 | MVP'de 8 platform, V2'de 3 platform daha | 1-2 gün süre kısıtı; demo için 8 format yeterli | 2026-07-08 |
| ADR-009 | React state (MVP), localStorage geçmiş (V2) | Basitlik; kalıcı storage MVP'de gerekmez | 2026-07-08 |
| ADR-010 | Platform metadata tek kaynak: `lib/constants/platforms.ts` | Senkronizasyon; docs ve kod arasında tutarlılık | 2026-07-08 |
| ADR-011 | 3 katmanlı prompt (system + platform + user) | Prompt kalitesi değerlendirme kriteri; kanal-spesifik kontrol | 2026-07-08 |
| ADR-012 | Zod validasyon API boundary'de | Type-safe input; Türkçe hata mesajları | 2026-07-08 |
| ADR-013 | Ürün adı: Repack (iç), İçerik Dönüştürücü (UI) | Kısa internal referans + açıklayıcı Türkçe başlık | 2026-07-08 |

## Session Notes

- Repository yalnızca 6 markdown context dosyasından oluşuyordu; kod henüz yoktu.
- Onaylanan stack: Next.js 15, TypeScript, Tailwind, shadcn/ui, Groq API.
- Onaylanan UI dili: Türkçe.
- Ender'in görevi (AI Destekli İçerik Üretici) bu repo kapsamı dışında.
- Scaffold tamamlandı: Next.js 15.5.20, Tailwind CSS 4, shadcn/ui v4 init, dark-first tema token'ları.
- Klasör adı npm kısıtı nedeniyle `repack-scaffold` alt klasöründe oluşturulup köke taşındı; paket adı `repack`.
- API route dosyaları henüz yazılmadı (adım 5–6); `app/api/transform/` ve `app/api/health/` boş klasör olarak hazır.
- `components/transform/` tamamlandı — 6 component (SourcePanel, OutputPanel, PlatformSelector, TransformSettings, TransformButton, TransformStepper).
- Teslim paketi için README, `docs/prompt-explanation.md` ve `samples/` klasörü implementation sonunda oluşturulacak.

## Related Documents

- Ürün spec: `project-overview.md`
- Mimari: `architecture.md`
- AI kuralları: `ai-workflow-rules.md`
- UI: `ui-context.md`
- Kod standartları: `code-standards.md`
