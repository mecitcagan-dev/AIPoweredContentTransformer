# AI Workflow Rules

## Approach

Bu proje spec-driven (belge odaklı) bir geliştirme yaklaşımıyla ilerler. `project-overview.md`, `architecture.md`, `ui-context.md`, `code-standards.md` ve bu dosya birlikte Single Source of Truth (SSOT) oluşturur. Tüm implementasyon bu belgelere dayanır; belgelerde tanımlanmamış davranış icat edilmez.

AI katmanı üç bileşenden oluşur:

1. **Prompt Engine** — System, platform ve user prompt'larını birleştirir.
2. **Transform Orchestrator** — İstek yaşam döngüsünü yönetir.
3. **AI Provider** — Groq API ile streaming iletişim kurar (interface üzerinden soyutlanmış).

## Prompt Architecture

Her dönüşüm isteği üç katmanlı prompt kullanır:

| Katman | Kaynak | Amaç |
|--------|--------|------|
| System | `lib/ai/prompts/system.ts` | Rol tanımı, genel kurallar, dil koruma |
| Platform | `lib/ai/prompts/{platform}.ts` | Kanal-spesifik format ve limit kuralları |
| User | `PromptEngine` tarafından runtime'da oluşturulur | Kaynak metin + ton + hedef kitle + uzunluk |

**Prompt birleştirme sırası:**

```
messages = [
  { role: "system", content: SYSTEM_PROMPT + PLATFORM_PROMPT },
  { role: "user", content: buildUserPrompt(source, tone, audience, length) }
]
```

## System Prompt

Aşağıdaki metin `lib/ai/prompts/system.ts` dosyasına birebir yazılır:

```
Sen profesyonel bir içerik dönüştürme uzmanısın. Görevin, kullanıcının verdiği mevcut içeriği farklı yayın kanalları için yeniden paketlemektir. Yeni içerik icat etmezsin; kaynak metindeki bilgileri, argümanları ve mesajı koruyarak hedef platformun formatına uyarlırsın.

Kurallar:
1. Kaynak metindeki gerçekleri, verileri ve ana mesajı koru. Uydurma bilgi, istatistik veya alıntı ekleme.
2. Kaynak metnin dilini koru. Türkçe kaynak → Türkçe çıktı. İngilizce kaynak → İngilizce çıktı.
3. Hedef platformun karakter limitlerine ve format kurallarına kesinlikle uy.
4. Ton talimatına uy (profesyonel, samimi veya ikna edici).
5. Hedef kitle belirtilmişse içeriği o kitleye göre uyarla.
6. Uzunluk talimatına uy (kısa, orta, uzun).
7. Yalnızca istenen formatta çıktı üret. Açıklama, meta yorum veya "İşte dönüştürülmüş içerik:" gibi ön ekler ekleme.
8. Markdown formatı yalnızca platform prompt'unda istenmişse kullan.
```

## User Prompt Template

`PromptEngine.buildUserPrompt()` tarafından oluşturulur:

```
Aşağıdaki kaynak içeriği belirtilen formata dönüştür.

Ton: {tone}
Hedef kitle: {audience || "Genel okuyucu"}
Uzunluk: {length}

--- KAYNAK İÇERİK ---
{source}
--- KAYNAK İÇERİK SONU ---
```

**Ton eşlemesi:**

| UI Değeri | Prompt Değeri |
|-----------|---------------|
| Profesyonel | Resmi, güvenilir, sektörel dil; jargon ölçülü |
| Samimi | Sıcak, sohbet havasında, "sen" dili |
| İkna Edici | Harekete geçirici, fayda odaklı, güçlü CTA |

**Uzunluk eşlemesi:**

| UI Değeri | Talimat |
|-----------|---------|
| Kısa | Platform limitinin %40'ına yakın, öz |
| Orta | Platform limitinin %70'ine yakın, dengeli |
| Uzun | Platform limitine yakın, detaylı |

## Platform Prompts (MVP)

### LinkedIn Post (`linkedin.ts`)

```
Platform: LinkedIn Post
Karakter limiti: Maksimum 3000 karakter

Format kuralları:
- İlk satır güçlü bir hook olmalı (dikkat çekici soru veya cesur ifade).
- Kısa paragraflar kullan (1-3 cümle). Paragraflar arasında boş satır bırak.
- Ana mesajı 2-4 paragrafta aktar.
- Son paragrafta net bir CTA (Call to Action) ekle.
- Metnin sonuna 3-5 ilgili hashtag ekle (ayrı satırda).
- Emoji kullanımı minimal olsun (en fazla 2-3).
- Profesyonel ama kişisel bir ton tercih et.
- Liste veya madde işareti kullanma; akıcı paragraflar tercih et.
```

### X Thread (`twitter-thread.ts`)

```
Platform: X (Twitter) Thread
Karakter limiti: Her tweet maksimum 280 karakter

Format kuralları:
- 3 ile 7 tweet arasında bir thread oluştur.
- Her tweet'i numaralandır: "1/", "2/", "3/" şeklinde başlat.
- İlk tweet en güçlü hook'u içermeli; okuyucuyu thread'e çekmeli.
- Her tweet bağımsız okunabilir olmalı ama bütün bir hikâye anlatmalı.
- Son tweet'te CTA veya özet cümle olsun.
- Hashtag'leri yalnızca son tweet'te kullan (en fazla 2).
- Emoji kullanımı tweet başına en fazla 1.
- 280 karakter limitini kesinlikle aşma; her tweet'i say.
```

### Instagram Caption (`instagram.ts`)

```
Platform: Instagram Caption
Karakter limiti: Maksimum 2200 karakter

Format kuralları:
- İlk satır dikkat çekici olmalı (feed'de görünen kısım).
- Emoji kullan (doğal ve ölçülü, abartma).
- Ana mesajı kısa paragraflar veya satır aralarıyla aktar.
- Metnin sonunda CTA ekle (ör. "Link bio'da", "Yorumlara yazın").
- Son satırlarda 5-10 ilgili hashtag ekle (ayrı blok olarak).
- Samimi ve görsel bir dile uygun yaz.
- @mention kullanma (kullanıcı belirtmedikçe).
```

### Facebook Post (`facebook.ts`)

```
Platform: Facebook Post
Karakter limiti: Maksimum 5000 karakter (hedef: 500-1500 arası)

Format kuralları:
- Samimi, topluluk odaklı bir ton kullan.
- İlk cümle merak uyandırmalı.
- Kısa paragraflar veya tek cümlelik satırlar kullan.
- Hikâye anlatımı veya kişisel deneyim tonu tercih et.
- Son cümlede okuyucuya soru sorarak etkileşim iste.
- Emoji kullanımı doğal olsun (3-5 arası).
- Hashtag kullanımı minimal (en fazla 3).
```

### Newsletter (`newsletter.ts`)

```
Platform: Newsletter
Karakter limiti: Maksimum 1500 karakter

Format kuralları:
- Konu satırı (Subject Line) ile başla — kısa, merak uyandırıcı, max 60 karakter.
- "Konu:" etiketiyle belirt.
- Giriş paragrafı: Okuyucuyu karşıla, bu sayının değerini özetle (2-3 cümle).
- 3 ana bölüm veya madde halinde içeriğin özünü aktar.
- Her bölüm kısa bir alt başlık veya kalın vurgu ile ayrılsın.
- Kapanış paragrafında CTA ekle (okumaya devam, web sitesini ziyaret, vb.).
- Samimi ama bilgilendirici bir ton.
```

### E-posta Taslağı (`email-draft.ts`)

```
Platform: E-posta Taslağı
Karakter limiti: Maksimum 800 karakter

Format kuralları:
- Konu satırı ile başla — "Konu:" etiketiyle, max 50 karakter.
- Kısa selamlama (ör. "Merhaba," veya "Sayın [İsim],").
- Gövde: Ana mesajı 2-4 cümlede aktar, net ve doğrudan.
- Tek bir CTA cümlesi ekle.
- Kısa kapanış (ör. "Saygılarımla," veya "Sevgiler,").
- İmza satırı için yer bırak ([Adınız] şeklinde placeholder).
- Resmi ama sıcak bir ton.
```

### Kısa Özet (`short-summary.ts`)

```
Platform: Kısa Özet
Karakter limiti: Maksimum 300 karakter

Format kuralları:
- Kaynak metnin en kritik mesajını 2-3 cümlede özetle.
- Gereksiz detay, örnek veya bağlam çıkar.
- Bağımsız okunabilir olmalı (kaynak metin olmadan anlaşılır).
- Aktif cümle yapısı kullan.
- Madde işareti veya başlık kullanma; düz paragraf olarak yaz.
```

### Madde Özet (`bullet-summary.ts`)

```
Platform: Madde Özet
Karakter limiti: Maksimum 500 karakter

Format kuralları:
- Kaynak metnin ana noktalarını 5-7 madde halinde listele.
- Her madde tek cümle olsun, kısa ve öz.
- Maddeler mantıksal sırayla (önem veya kronoloji) dizilsin.
- Madde işareti olarak "•" veya "-" kullan.
- Giriş veya kapanış cümlesi ekleme; yalnızca madde listesi.
```

## Bundle Mode (SEO + Sosyal Medya Paketi)

Varsayılan mod: tek makale girdisi → sıralı 4 Groq çağrısı → etiketli çıktılar (SEO meta + LinkedIn + X Thread + Instagram).

**Section sırası (`BUNDLE_SECTIONS`):** `seo-meta` → `linkedin` → `twitter-thread` → `instagram`

**`BundleSectionId` (daraltılmış union):** `"seo-meta" | "linkedin" | "twitter-thread" | "instagram"` — tüm `PlatformId` değil; bundle dışı platformlar derleme zamanında engellenir.

**Prompt stratejisi:** 4 ayrı çağrı; her biri `buildBundleSectionMessages(section, base)` ile oluşturulur. Mevcut platform prompt dosyaları (`linkedin.ts`, `twitter-thread.ts`, `instagram.ts`) **birleştirilmez**, olduğu gibi kullanılır.

**SEO meta tek çağrı:** `seo-meta` section çıktısı etiketli iki alan üretir; UI `BAŞLIK:` / `AÇIKLAMA:` prefix'leri ile parse eder.

### SEO Meta (`seo-meta.ts`)

```
Platform: SEO Meta
Karakter limiti: Başlık maksimum 60 karakter, açıklama maksimum 155 karakter

Format kuralları:
- Yalnızca iki satır üret; başka içerik ekleme.
- İlk satır: BAŞLIK: (maksimum 60 karakter, kaynak içeriği özetleyen SEO başlığı)
- İkinci satır: AÇIKLAMA: (maksimum 155 karakter, kaynak içeriği özetleyen meta açıklama)
- Açıklama, meta yorum veya "İşte SEO meta:" gibi ön ekler ekleme.
```

**Bundle SSE event'leri:** `section_start`, chunk (`{ section, content }`), `section_end`, `error`, `done` — mevcut single-mode `encodeChunkEvent` dokunulmaz.

**API route:** `POST /api/transform/bundle` — `bundleRequestSchema` ile validate; `TransformOrchestrator.transformBundle()` SSE stream döner.

**Kısmi hata:** Section N'de hata → tamamlanan section içerikleri korunur; retry tüm bundle'ı sıfırdan başlatır (MVP).

**Rate limit:** 1 bundle = 4 ardışık API çağrısı; her section ön-istek retry politikası bağımsız uygulanır (`lib/utils/retry.ts`). Section ortasında hata → SSE error, kısmi çıktı korunur.

## Groq Configuration

NPM paketi: `groq-sdk` (import: `import Groq from "groq-sdk"`).

**BYOK modu (`cloud-deploy`):** `GroqProvider` constructor'ı `apiKey` parametresi alır. Parametre verilmezse `process.env.GROQ_API_KEY`'e fallback yapılır (yalnızca local geliştirme kolaylığı). Cloud ortamında key `x-groq-api-key` header'ı üzerinden istek başına iletilir.

| Parametre | Değer | Gerekçe |
|-----------|-------|---------|
| Model | `llama-3.3-70b-versatile` | Yüksek kalite, Groq free tier'da mevcut |
| stream | `true` | Zorunlu — UX için streaming |
| temperature | `0.7` (genel), `0.3` (özet formatları) | Özetlerde tutarlılık, sosyal medyada yaratıcılık |
| max_tokens | Platforma göre dinamik | Aşağıdaki tabloya bak |
| top_p | `1` | Varsayılan |
| stop | `null` | Platform prompt'u formatı belirler |

**max_tokens tablosu:**

| Platform | max_tokens |
|----------|------------|
| SEO Meta (bundle) | 256 |
| LinkedIn Post | 1024 |
| X Thread | 1024 |
| Instagram Caption | 768 |
| Facebook Post | 1024 |
| Newsletter | 768 |
| E-posta Taslağı | 512 |
| Kısa Özet | 256 |
| Madde Özet | 384 |

**Ön-istek retry politikası** (stream başlamadan önce):

- Geçerli senaryo: Groq API'ye ilk bağlantı kurulurken oluşan 429 (rate limit) ve 5xx hataları
- 3 deneme, exponential backoff: 1s → 2s → 4s
- `Retry-After` header varsa ona uy
- Implementasyon: `lib/utils/retry.ts` (server-side, `GroqProvider` içinde)

**Stream-ortası hatalar** (stream zaten başladıktan sonra):

- Geçerli senaryo: Token akışı devam ederken oluşan hatalar (rate limit, ağ kopması, sunucu hatası dahil)
- Retry **yapılmaz** — kısmi çıktı korunmaz, stream sonlandırılır
- Hata doğrudan SSE `error` event olarak client'a iletilir; kullanıcı "Tekrar Dene" ile yeni istek başlatır
- Client timeout: 60 saniye (streaming)

**Health check ve dev server restart:**

- Kullanıcı `.env.local` dosyasına `GROQ_API_KEY` ekleyip "Bağlantıyı Test Et"e bastığında Next.js dev server `.env.local` değişikliğini algılayıp otomatik yeniden başlayabilir
- Bu sırada `/api/health` isteği geçici olarak başarısız olabilir (bağlantı reset, 502 veya ağ hatası)
- Henüz hiç başarılı health check yapılmamışsa kullanıcıya şu mesaj gösterilir: "Sunucu yeniden başlatılıyor olabilir, birkaç saniye sonra tekrar deneyin." (`ui-context.md` Error UX tablosu)
- Başarılı health check sonrası aynı oturumda geçici hatalar standart ağ/sunucu hata mesajlarıyla ele alınır

**Stream iptali (yeni dönüştürme isteği):**

- Kullanıcı aktif bir stream devam ederken platform veya ayar değiştirip tekrar "Dönüştür"e basarsa:
  1. Client `AbortController` ile önceki fetch/SSE isteğini iptal eder (`lib/hooks/useTransform.ts`)
  2. Önceki kısmi çıktı temizlenir
  3. Yeni istek başlatılır
- Aynı anda yalnızca bir aktif transform stream'i olabilir

**Bundle stream iptali (invariant #11):**

- Bundle modunda da yalnızca bir aktif `transformBundle` stream'i olabilir
- Yeni bundle isteği başladığında client `AbortController` ile önceki fetch/SSE iptal eder; tüm `BundleOutput.sections` state'i sıfırlanır (`useTransformBundle` — Adım 3)
- Kısmi hata durumunda tamamlanan section içerikleri korunur; "Tekrar Dene" tüm bundle'ı seo-meta'dan itibaren yeniden başlatır

**Girdi limitleri:**

- Minimum kaynak uzunluğu: 50 karakter
- Maksimum kaynak uzunluğu: 8000 karakter (API'ye gönderilmeden önce truncate veya kullanıcıya uyarı)
- 4000+ karakterde UI uyarı banner'ı gösterilir (`ui-context.md`)

## Scoping Rules

- Aynı anda yalnızca bir feature unit üzerinde çalış
- Küçük, uçtan uca doğrulanabilir adımları tercih et
- İlişkisiz sistem sınırlarını tek implementasyon adımında birleştirme
- Prompt değişikliği yapıldığında bu dosyayı güncelle, sonra kodu güncelle

## When to Split Work

Bir implementasyon adımını şu durumlarda böl:

- UI değişikliği + AI/prompt değişikliği aynı adımda
- Birden fazla ilişkisiz API route
- Context dosyalarında tanımlanmamış davranış
- Uçtan uca hızlı doğrulama yapılamıyorsa

## Handling Missing Requirements

- Context dosyalarında tanımlanmamış ürün davranışı icat etme
- Belirsizlik varsa ilgili context dosyasında çöz, sonra implement et
- Eksik gereksinim varsa `progress-tracker.md` → Open Questions'a ekle ve implementasyonu durdur

## Protected Files

Aşağıdaki dosyalar açık talimat olmadan değiştirilmez:

- `components/ui/*` — shadcn/ui tarafından üretilen bileşenler
- `node_modules/` — üçüncü parti kütüphane içleri
- Üçüncü parti kütüphane kaynak kodları

## Keeping Docs in Sync

Implementasyon değişikliği yapıldığında ilgili context dosyasını güncelle:

| Değişiklik türü | Güncellenecek dosya |
|-----------------|---------------------|
| Yeni platform eklendi | Bu dosya + `project-overview.md` + `lib/constants/platforms.ts` |
| Mimari değişiklik | `architecture.md` |
| UX / tasarım değişikliği | `ui-context.md` |
| Kod convention değişikliği | `code-standards.md` |
| Kapsam değişikliği | `project-overview.md` |
| İlerleme durumu | `progress-tracker.md` |

## Before Moving to the Next Unit

1. Mevcut unit tanımlanan kapsamda uçtan uca çalışıyor
2. `architecture.md` invariant'ları ihlal edilmedi
3. `progress-tracker.md` tamamlanan işi yansıtıyor
4. `npm run build` hatasız geçiyor
5. Prompt değişikliği varsa bu dosyadaki metin kodla senkron

## Related Documents

- Mimari ve provider abstraction: `architecture.md`
- Platform listesi ve kapsam: `project-overview.md`
- Loading/error UX kuralları: `ui-context.md`
