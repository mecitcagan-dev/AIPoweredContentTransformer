# İçerik Dönüştürücü (Repack)

**Mevcut içeriğinizi tek tıkla LinkedIn, X, Instagram ve daha fazlası için yeniden paketleyin.**

İçerik Dönüştürücü, bir makale veya metni farklı yayın kanalları için AI destekli olarak yeniden formatlayan lokal bir web uygulamasıdır. Yeni içerik üretmek yerine kaynak metindeki mesajı koruyarak platform kurallarına uyarlar. Bu bir sohbet aracı değildir; yapılandırılmış bir dönüşüm iş akışı sunar.

## Özellikler

- **8 platform formatı:** LinkedIn Post, X Thread, Instagram Caption, Facebook Post, Newsletter, E-posta Taslağı, Kısa Özet, Madde Özet
- **Streaming çıktı:** Server-Sent Events (SSE) ile token-by-token AI yanıtı
- **Kaynak girişi:** Metin yapıştırma, `.txt` / `.md` dosya yükleme, yerleşik örnek makale
- **Dönüşüm ayarları:** Ton (Profesyonel / Samimi / İkna Edici), hedef kitle, uzunluk (Kısa / Orta / Uzun)
- **Profesyonel UX:** Loading skeleton, aşamalı durum mesajları, panoya kopyala, Türkçe hata mesajları
- **Güvenli API kullanımı:** Groq anahtarı tarayıcıda saklanır, istek başına sunucuya iletilir; sunucuda kalıcı olarak tutulmaz. `/api/health` ile bağlantı testi

## Kurulum

### Gereksinimler

- Node.js 18+
- npm
- [Groq API anahtarı](https://console.groq.com/keys)

### Adımlar

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

### API anahtarı

İki yöntemden biri yeterlidir:

**1. Uygulama içi (önerilen)**  
İlk açılışta onboarding diyaloğu görünür. Groq API anahtarınızı girin ve **Kaydet**'e tıklayın. Anahtar yalnızca tarayıcınızda (`localStorage`) saklanır; her istekte sunucuya iletilir, sunucuda kaydedilmez.

**2. Ortam değişkeni (isteğe bağlı, lokal geliştirme)**  
Proje kökünde `.env.local` oluşturup anahtarı tanımlayabilirsiniz. UI'da anahtar girmeden de çalışır; header yoksa sunucu env değerine düşer.

```env
GROQ_API_KEY=gsk_...
```

Anahtarınızı [Groq Console](https://console.groq.com/keys) üzerinden alabilirsiniz.

Ayarlar simgesinden (Header) API anahtarını daha sonra da güncelleyebilirsiniz.

### Üretim derlemesi

```bash
npm run build
npm start
```

## Kullanım Akışı

1. Uygulamayı lokal ortamda açın (`npm run dev`).
2. API anahtarı yoksa onboarding diyaloğunda Groq anahtarınızı girin ve **Kaydet** ile doğrulayın (veya `.env.local` ile yapılandırın).
3. Kaynak makaleyi sol panele yapıştırın veya dosya yükleyin (veya **Örnek makale yükle**).
4. Hedef platform kartını seçin.
5. İsteğe bağlı olarak **Gelişmiş Ayarlar**'dan ton, hedef kitle ve uzunluk belirleyin.
6. **Dönüştür**'e tıklayın; çıktı sağ panelde streaming ile görünür.
7. **Kopyala** ile panoya alın veya farklı bir platform için tekrar dönüştürün.

## Tech Stack

| Katman       | Teknoloji                            | Rol                                      |
| ------------ | ------------------------------------ | ---------------------------------------- |
| Framework    | Next.js 15 (App Router) + TypeScript | SSR shell, API routes, SSE streaming     |
| UI           | Tailwind CSS 4 + shadcn/ui           | Tasarım sistemi ve bileşen kütüphanesi   |
| State        | React useState + hooks               | Form, çıktı ve UI state yönetimi         |
| Validation   | Zod                                  | API boundary ve form validasyonu         |
| AI           | Groq SDK (`groq-sdk`)                | `llama-3.3-70b-versatile`, streaming     |
| Storage      | React state + localStorage           | Dönüşüm verisi; API anahtarı (tarayıcı)  |
| Env          | `.env.local` → `GROQ_API_KEY`        | İsteğe bağlı lokal geliştirme fallback'i |
| Toasts       | Sonner                               | Kopyalama bildirimleri                   |
| Icons        | Lucide React                         | Stroke-based ikonlar                     |
| Fonts        | Geist Sans + Geist Mono              | UI metni ve mono alanlar                 |

## Proje Yapısı

```
app/
  layout.tsx, page.tsx, globals.css
  api/
    transform/route.ts    # POST — SSE streaming dönüşüm
    health/route.ts       # GET — API anahtarı doğrulama
components/
  ui/                     # shadcn/ui (doğrudan değiştirilmez)
  transform/              # SourcePanel, OutputPanel, PlatformSelector, ...
  layout/                 # Header, OnboardingDialog
lib/
  ai/                     # Provider abstraction, prompt engine, prompts/
  validation/             # Zod şemaları
  constants/              # Platform metadata, örnek makale
  hooks/                  # useTransform, useClipboard, useHealthCheck
  utils/                  # retry, sse, cn, api-key-storage, resolve-groq-api-key
types/
  transform.ts
docs/
  prompt-explanation.md   # Prompt mühendisliği açıklaması
samples/                  # Örnek dönüşüm çıktıları
```

## Bu Proje Kapsamı Dışında

Aşağıdakiler bilinçli olarak kapsam dışı bırakılmıştır:

- Kullanıcı authentication ve hesap sistemi
- Veritabanı ve kalıcı sunucu tarafı depolama (MVP)
- Cloud deployment, CI/CD, Docker zorunluluğu
- Çok kullanıcılı / production altyapısı

Uygulama lokal, tek kullanıcılı olarak çalışır.

## Neden Bu Mimari?

AI sağlayıcıları ortak bir `AIProvider` interface'i üzerinden soyutlanır. v1'de yalnızca `GroqProvider` implement edilmiştir; route handler ve `TransformOrchestrator` hangi sağlayıcının kullanıldığını bilmez.

```typescript
interface AIProvider {
  readonly name: string;
  transform(request: TransformRequest): AsyncIterable<string>;
  validateConfig(): Promise<boolean>;
}
```

`createProvider()` factory pattern'i sayesinde ileride OpenAI, Gemini veya Claude eklemek için yalnızca yeni bir provider sınıfı ve factory kaydı yeterlidir — UI, API route ve orchestrator katmanları değişmez (Dependency Inversion). Prompt şablonları `lib/ai/prompts/` altında merkezi tutulur; platform kuralları kanal dosyalarına ayrılarak bakım kolaylaşır.

Detaylı mimari: `architecture.md`  
Prompt stratejisi: `docs/prompt-explanation.md`  
Örnek çıktılar: `samples/`

## Lisans

Bu proje staj teslim paketi kapsamında geliştirilmiştir.
