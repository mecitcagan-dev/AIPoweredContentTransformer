# İçerik Dönüştürücü (Repack)

**Mevcut içeriğinizi tek işlemde SEO meta + sosyal medya paketine dönüştürün.**

İçerik Dönüştürücü, bir makale veya metni farklı yayın kanalları için AI destekli olarak yeniden formatlayan bir web uygulamasıdır. Yeni içerik üretmek yerine kaynak metindeki mesajı koruyarak platform kurallarına uyarlar. Bu bir sohbet aracı değildir; yapılandırılmış bir dönüşüm iş akışı sunar.

## Özellikler

### Varsayılan: SEO + Sosyal Medya Paketi (Bundle Mode)

- **Tek işlemde 5 çıktı:** SEO başlık, meta açıklama, LinkedIn postu, X thread, Instagram caption
- **4 aşamalı progress bar:** SEO → LinkedIn → X → Instagram (sıralı streaming)
- **Paketi İndir (.md):** Tamamlanan paketi Markdown dosyası olarak indirme
- **Karakter sayacı uyarıları:** Limit yaklaşımı ve aşımında görsel geri bildirim

### Gelişmiş: Tek Platform Seç (bonus mod)

- **8 platform formatı:** LinkedIn Post, X Thread, Instagram Caption, Facebook Post, Newsletter, E-posta Taslağı, Kısa Özet, Madde Özet
- Tek seferde bir platform için özelleştirilmiş çıktı

### Ortak

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

### Bundle (varsayılan) — 2 tık

1. Uygulamayı açın (`npm run dev` veya deploy URL).
2. API anahtarı yoksa onboarding'de Groq anahtarınızı girin ve doğrulayın.
3. Kaynak makaleyi sol panele yapıştırın veya dosya yükleyin (**Örnek makale yükle**).
4. İsteğe bağlı **Gelişmiş Ayarlar**'dan ton, hedef kitle ve uzunluk belirleyin.
5. **Dönüştür**'e tıklayın; sağ panelde 5 kartlı paket çıktısı streaming ile görünür.
6. Kartları ayrı ayrı **Kopyala** veya tam paketi **Paketi İndir (.md)** ile alın.

### Gelişmiş: Tek Platform Seç

1. Üst mod seçiciden **Gelişmiş: Tek Platform Seç**'e geçin.
2. Kaynak metni girin, hedef platform kartını seçin.
3. İsteğe bağlı ayarları belirleyin ve **Dönüştür**'e tıklayın.
4. Sağ panelde tek platform çıktısı streaming ile görünür; **Kopyala** ile panoya alın.

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
    transform/route.ts         # POST — single-platform SSE
    transform/bundle/route.ts  # POST — bundle SSE (4 section)
    health/route.ts            # GET — API anahtarı doğrulama
components/
  ui/                          # shadcn/ui (doğrudan değiştirilmez)
  transform/                   # SourcePanel, BundleOutputPanel, TransformModeSelector, ...
  layout/                      # Header, OnboardingDialog
lib/
  ai/                          # Provider abstraction, prompt engine, prompts/
  validation/                  # Zod şemaları
  constants/                   # Platform metadata, örnek makale
  hooks/                       # useTransform, useTransformBundle, useClipboard
  utils/                       # retry, sse, parse-seo-meta, api-key-storage
types/
  transform.ts
docs/
  prompt-explanation.md        # Prompt mühendisliği açıklaması
samples/                       # Örnek dönüşüm çıktıları (bundle dahil)
```

## Bu Proje Kapsamı Dışında

Aşağıdakiler bilinçli olarak kapsam dışı bırakılmıştır:

- Kullanıcı authentication ve hesap sistemi
- Veritabanı ve kalıcı sunucu tarafı depolama (MVP)
- Cloud deployment, CI/CD, Docker zorunluluğu
- Çok kullanıcılı / production altyapısı

Uygulama lokal veya BYOK cloud deploy ile tek kullanıcılı olarak çalışır.

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
Örnek çıktılar: `samples/` (tek platform + bundle paketi)

## Lisans

Bu proje staj teslim paketi kapsamında geliştirilmiştir.
