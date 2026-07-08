# Architecture Context

## Stack

| Layer      | Technology                              | Role                                              |
| ---------- | --------------------------------------- | ------------------------------------------------- |
| Framework  | Next.js 15 (App Router) + TypeScript    | SSR shell, API routes, SSE streaming              |
| UI         | Tailwind CSS 4 + shadcn/ui              | Tasarım sistemi ve bileşen kütüphanesi            |
| State      | React useState + useReducer (Context)   | Form, çıktı ve UI state yönetimi                  |
| Validation | Zod                                     | API boundary ve form validasyonu                  |
| AI         | Groq SDK (`groq-sdk` npm)               | `llama-3.3-70b-versatile`, streaming zorunlu      |
| Storage    | React state (MVP); localStorage (V2)    | Aktif dönüşüm; oturum geçmişi                     |
| Env        | `.env.local` → `GROQ_API_KEY`           | Server-side only, client'a sızmaz                 |
| Icons      | Lucide React                            | Stroke-based ikonlar                              |
| Fonts      | Geist Sans + Geist Mono                 | UI metni ve sayaç/mono alanlar                    |

Auth, veritabanı, Docker, CI/CD ve cloud deployment bu projenin kapsamı dışındadır.

## System Boundaries

- `app/` — Route tanımları, root layout, ana sayfa ve API route handler'ları. UI orchestration burada ince tutulur; iş mantığı `lib/` altına taşınır.
- `app/api/transform/` — POST isteği alır, Zod ile validate eder, `TransformOrchestrator`'ı çağırır, SSE stream döner.
- `app/api/health/` — `GROQ_API_KEY` varlığını ve Groq bağlantısını doğrular; onboarding akışında kullanılır.
- `components/ui/` — shadcn/ui tarafından üretilen bileşenler. Doğrudan değiştirilmez; wrapper ile özelleştirilir.
- `components/transform/` — Dönüşüm ekranına özel UI bileşenleri (SourcePanel, OutputPanel, PlatformSelector, vb.).
- `components/layout/` — Header, OnboardingDialog gibi layout bileşenleri.
- `lib/ai/` — AI provider abstraction, prompt engine, platform prompt şablonları.
- `lib/validation/` — Zod şemaları (`transform-schema.ts`).
- `lib/constants/` — Platform metadata tek kaynağı (`platforms.ts`).
- `lib/hooks/` — Client-side hook'lar (`useTransform`, `useClipboard`).
- `types/` — Paylaşılan TypeScript tipleri.

## Data Flow

```
Client (TransformUI)
  │
  │ POST /api/transform { source, platform, tone, audience, length }
  ▼
API Route (route.ts)
  │ Zod validate
  ▼
TransformOrchestrator
  │ PromptEngine.build(platform, params)
  ▼
GroqProvider.transform(request)
  │ AsyncIterable<string> (SSE chunks)
  ▼
Client OutputPanel (streaming render)
```

**İstek yaşam döngüsü:**

1. Kullanıcı formu doldurur ve "Dönüştür"e tıklar.
2. `useTransform` hook'u `POST /api/transform` çağrısı yapar.
3. Route handler girdiyi Zod ile doğrular; geçersizse `400` + `{ error: string }` döner.
4. `TransformOrchestrator` ilgili platform prompt'unu `PromptEngine` ile oluşturur.
5. `GroqProvider` Groq API'ye streaming istek gönderir.
6. Route handler SSE response başlatır; chunk'lar client'a iletilir.
7. Client token-by-token çıktıyı render eder; stream bitince durum `idle` olur.

**Stream iptali:** Kullanıcı dönüşüm devam ederken platform veya ayar değiştirip tekrar "Dönüştür"e basarsa, `useTransform` hook'u önceki isteği `AbortController` ile iptal eder, kısmi çıktıyı temizler ve yeni isteği başlatır. Aynı anda yalnızca bir aktif stream olabilir.

## AI Provider Abstraction

Tüm AI sağlayıcıları ortak bir interface implement eder. v1'de yalnızca `GroqProvider` vardır; ileride OpenAI, Gemini, Claude, OpenRouter ve Ollama aynı interface üzerinden eklenir.

```typescript
interface TransformRequest {
  source: string;
  platform: PlatformId;
  tone: Tone;
  audience?: string;
  length: Length;
}

interface AIProvider {
  readonly name: string;
  transform(request: TransformRequest): AsyncIterable<string>;
  validateConfig(): Promise<boolean>;
}
```

**Provider factory:**

```typescript
type ProviderType = "groq"; // V2+: "openai" | "gemini" | ...

function createProvider(type: ProviderType): AIProvider;
```

Factory pattern sayesinde route handler veya orchestrator hangi sağlayıcının kullanıldığını bilmez; yalnızca `AIProvider` interface'ine bağımlıdır (Dependency Inversion).

## File Structure

```
app/
  layout.tsx
  page.tsx
  globals.css
  api/
    transform/route.ts
    health/route.ts
components/
  ui/                          # shadcn — dokunulmaz
  transform/
    SourcePanel.tsx
    OutputPanel.tsx
    PlatformSelector.tsx
    TransformSettings.tsx
    TransformButton.tsx
    TransformStepper.tsx
  layout/
    Header.tsx
    OnboardingDialog.tsx
lib/
  ai/
    types.ts
    provider-factory.ts
    transform-orchestrator.ts
    prompt-engine.ts
    providers/
      groq-provider.ts
    prompts/
      index.ts
      system.ts
      linkedin.ts
      twitter-thread.ts
      instagram.ts
      facebook.ts
      newsletter.ts
      email-draft.ts
      short-summary.ts
      bullet-summary.ts
  validation/
    transform-schema.ts
  constants/
    platforms.ts
    sample-article.ts         # Built-in örnek makale (project-overview.md spec)
  hooks/
    useTransform.ts
    useClipboard.ts
  utils/
    retry.ts
    sse.ts
types/
  transform.ts
```

## Storage Model

- **React state (MVP):** Aktif kaynak metin, seçili platform, ton/uzunluk ayarları, streaming çıktı, UI durumu (loading, error).
- **localStorage (V2):** `repack_history` anahtarı altında son 10 dönüşüm JSON olarak saklanır. Yapı: `{ id, timestamp, platform, sourcePreview, output }`.
- **Dosya sistemi:** `.env.local` (gitignore'da) — `GROQ_API_KEY`. Kullanıcı tarafından yönetilir.
- **Veritabanı / Blob storage:** Yok. MVP ve V2 kapsamında gerekmez.

## Auth and Access Model

Bu uygulama authentication veya authorization katmanı içermez. API anahtarı yönetimi iki modda çalışır:

### Local mod (main branch / geliştirme)

- API anahtarı `.env.local` dosyasında `GROQ_API_KEY` olarak tutulur.
- Yalnızca server-side route handler'lar `process.env` üzerinden okur.
- Client isteklerinde `x-groq-api-key` header'ı gönderilmez; sunucu env key'e fallback yapar.

### Cloud / BYOK mod (`cloud-deploy` branch)

- API anahtarı sunucuda **asla** saklanmaz veya persist edilmez.
- Kullanıcı kendi Groq anahtarını tarayıcıda `localStorage` (`repack_groq_api_key`) içinde tutar.
- Her `/api/transform` ve `/api/health` isteğinde client `x-groq-api-key` header'ı gönderir.
- Sunucu bu key'i yalnızca o istek süresince Groq API'ye iletmek için kullanır (proxy görevi); key loglanmaz, response'a dahil edilmez, disk/DB'ye yazılmaz.
- Header yoksa ve `GROQ_API_KEY` env de tanımlı değilse istek `400` + `"API anahtarı bulunamadı"` ile reddedilir.
- Header yoksa ancak env key varsa (local geliştirme uyumluluğu) sunucu env key'e fallback yapar.

`/api/health` yalnızca anahtarın geçerliliğini kontrol eder; anahtar değerini response'a dahil etmez.

## Dependency Rules

```
app/ → components/, lib/, types/
components/transform/ → components/ui/, lib/hooks/, lib/constants/, types/
lib/ai/ → lib/constants/, types/
lib/ai/providers/ → lib/ai/types.ts, groq-sdk
app/api/ → lib/ai/, lib/validation/
```

- `lib/` hiçbir zaman `components/` veya `app/` import etmez.
- `components/ui/` dışarıdan import alır ama proje koduna bağımlı değildir.
- Prompt şablonları yalnızca `lib/ai/prompts/` altında yaşar; route handler'da inline prompt yazılmaz.

## Invariants

1. **API key server'da asla persist edilmez veya loglanmaz** — BYOK modunda client zaten key'in sahibidir; sunucu yalnızca istek süresince proxy görevi görür. Local modda key `process.env.GROQ_API_KEY` üzerinden okunur; client'a response veya log ile sızdırılmaz.
2. **Streaming zorunlu** — Tüm AI dönüşüm yanıtları SSE ile stream edilir; tam yanıt beklenmez.
3. **Prompt template'leri merkezi** — Platform prompt'ları yalnızca `lib/ai/prompts/` altında tanımlanır.
4. **Platform metadata tek kaynak** — Platform listesi, limitler ve etiketler yalnızca `lib/constants/platforms.ts` dosyasında tutulur.
5. **shadcn/ui dosyaları değiştirilmez** — Özelleştirme wrapper component veya className ile yapılır.
6. **Route handler ince kalır** — Validate → orchestrate → stream; iş mantığı `lib/` altındadır.
7. **Tutarlı hata formatı** — JSON hatalar `{ error: string }` shape'inde döner.
8. **Auth/DB yok** — MVP'de authentication, veritabanı veya harici storage kullanılmaz.
9. **Yeni transform isteği önceki stream'i iptal eder** — Yeni dönüştürme başladığında client tarafında `AbortController` ile önceki fetch/SSE iptal edilir; kısmi çıktı temizlenir (`useTransform` hook'u).

## Architecture Decisions (cloud-deploy)

| ID      | Karar | Gerekçe | Tarih |
| ------- | ----- | ------- | ----- |
| ADR-014 | BYOK modu: Vercel deploy için client-side key yönetimi | Herkesin kendi Groq quota'sını kullanması, sunucu tarafında key paylaşımı riskini ortadan kaldırma | 2026-07-08 |

## Related Documents

- Ürün kapsamı ve özellik listesi: `project-overview.md`
- Prompt şablonları ve Groq konfigürasyonu: `ai-workflow-rules.md`
- Kod yazım kuralları: `code-standards.md`
- Tasarım token'ları: `ui-context.md`
