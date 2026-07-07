# İçerik Dönüştürücü (Repack)

## Overview

İçerik Dönüştürücü, mevcut bir makale veya metni farklı yayın kanalları için yeniden paketleyen AI destekli bir web uygulamasıdır. Kullanıcı kaynak içeriğini yapıştırır veya yükler, hedef platformu seçer, isteğe bağlı olarak ton ve hedef kitle ayarlarını belirler; yapay zeka aynı içeriği seçilen kanalın formatına, uzunluk sınırlarına ve tonuna uygun şekilde dönüştürür.

Bu uygulama bir AI sohbet aracı değildir. Yeni içerik üretmek yerine mevcut içeriği koruyarak farklı platformlara uyarlar. Hedef kullanıcılar içerik pazarlamacıları, sosyal medya yöneticileri, küçük işletme sahipleri ve blog yazarlarıdır. Uygulama yalnızca lokal ortamda çalışır; kullanıcı deneyimi (UX) tüm teknik ve ürün kararlarının temel önceliğidir.

**Tek cümlelik değer önerisi:** Mevcut içeriğinizi tek tıkla LinkedIn, X, Instagram ve daha fazlası için yeniden paketleyin.

## Goals

1. Kullanıcının 3 tıklamada (yapıştır → platform seç → dönüştür) anlamlı, kanala uygun çıktı almasını sağlamak.
2. En az 8 platform formatında güvenilir, streaming destekli AI dönüşümü sunmak.
3. Profesyonel, startup kalitesinde bir UX ile staj teslim paketini (kod, README, örnek çıktılar, prompt açıklaması, demo) eksiksiz tamamlamak.
4. Genişletilebilir AI katmanı kurarak ileride OpenAI, Gemini, Claude gibi sağlayıcıların minimum değişiklikle eklenebilmesini sağlamak.

## Core User Flow

1. Kullanıcı uygulamayı lokal ortamda açar (`npm run dev`).
2. İlk açılışta API anahtarı yoksa onboarding diyaloğu görünür; kullanıcı Groq API anahtarını `.env.local` dosyasına ekler ve bağlantıyı test eder.
3. Kullanıcı kaynak makaleyi sol panele yapıştırır veya `.txt`/`.md` dosyası yükler.
4. Alt panelden hedef platform kartını seçer (ör. LinkedIn Post).
5. İsteğe bağlı olarak Gelişmiş Ayarlar'dan ton, hedef kitle ve uzunluk belirler.
6. "Dönüştür" butonuna tıklar; AI çıktısı sağ panelde streaming ile görünür.
7. Kullanıcı çıktıyı inceler, "Kopyala" ile panoya alır veya farklı bir platform için tekrar dönüştürür.

## Features

### MVP (Demo-Ready)

**Kaynak Girişi**
- Metin yapıştırma (textarea)
- Dosya yükleme (`.txt`, `.md`)
- Karakter ve kelime sayacı
- 4000+ karakterde uyarı banner'ı
- "Örnek makale yükle" boş durum CTA'sı

**Built-in Örnek Makale (`lib/constants/sample-article.ts`)**

Empty state demosu için yerleşik örnek makale aşağıdaki spec'e uyar:

| Özellik | Değer |
|---------|-------|
| Dil | Türkçe |
| Uzunluk | 400–600 karakter |
| Konu | Uzaktan çalışmanın ekip verimliliğine etkisi (genel iş/teknoloji teması) |
| Amaç | Kısa, temsili içerik; FTUE ve demo akışında hızlı deneme |
| Uyarı eşiği | 4000+ karakter uyarı banner'ını **tetiklemez** |

**Platform Dönüşümü (8 format)**
- LinkedIn Post
- X (Twitter) Thread
- Instagram Caption
- Facebook Post
- Newsletter
- E-posta Taslağı
- Kısa Özet
- Madde Özet

**Dönüşüm Ayarları**
- Ton: Profesyonel, Samimi, İkna Edici
- Hedef kitle (opsiyonel metin alanı)
- Uzunluk: Kısa, Orta, Uzun

**Çıktı Deneyimi**
- Server-Sent Events (SSE) ile streaming AI yanıtı
- Platform badge ve karakter sayacı
- Panoya kopyala + başarı toast'u
- Loading skeleton ve aşamalı durum mesajları

**Kurulum ve Hata Yönetimi**
- API anahtarı onboarding diyaloğu
- `/api/health` ile bağlantı testi
- Türkçe validasyon, API ve ağ hata mesajları

### V2 (Staj Sonrası)

- Kalan 3 platform: Medium Article, SEO Article, Basın Bülteni
- Oturum geçmişi (`localStorage`, son 10 dönüşüm)
- Çıktıyı `.txt` / `.md` olarak indirme
- "Yeniden üret", "Kısalt", "Uzat" çıktı aksiyonları
- Karanlık / aydınlık tema toggle
- Groq model seçimi (`llama-3.3-70b-versatile` vs `llama-3.1-8b-instant`)

### Future

- Ek AI sağlayıcıları: OpenAI, Gemini, Claude, OpenRouter, Ollama
- URL'den makale çekme
- Çoklu platform toplu dönüşüm (batch)
- Marka sesi profili
- Kaynak | çıktı yan yana karşılaştırma (diff) modu

## Staj Görevi Analizi

### Zorunlu Gereksinimler

| Gereksinim | Kaynak | Gerekçe |
|------------|--------|---------|
| Mevcut makaleyi farklı kanallara dönüştürme | Görev tanımı | Çekirdek değer önerisi — üretim değil, yeniden paketleme |
| AI API entegrasyonu (Groq) | Proje brief | Prompt kalitesi değerlendirme kriteri |
| Kaynak kod + README + 3 örnek çıktı + prompt açıklaması + 10 dk demo | Staj sheet | Minimum teslim paketi |
| Kod kalitesi + prompt kalitesi | Staj sheet | Asıl değerlendirme ekseni |
| Çalışan lokal uygulama | Proje brief | Cloud ve auth gerekmez |

### Gizli Beklentiler

- **UX önceliği:** Staj görüşmesinde vurgulanan "bizim için en önemli şey kullanıcı deneyimi" — sadece çalışan bir CLI yeterli değil; akıcı, düşünülmüş bir ürün bekleniyor.
- **Bağımsızlık:** Takıldığında destek alınabilir ancak kendi başına ilerleme yeteneği de ölçülüyor.
- **Prompt mühendisliği:** Yarım sayfalık prompt açıklaması ayrıca değerlendirilecek; kanal-spesifik prompt stratejisi dokümante edilmeli (`ai-workflow-rules.md`).
- **Süre baskısı:** 1–2 gün önerisi → MVP odaklı geliştirme, over-engineering'den kaçınılmalı.

### Kullanıcı İhtiyaçları

| İhtiyaç | Çözüm |
|---------|-------|
| Aynı içeriği birden fazla kanala hızlı uyarlamak | Platform kartları + tek tık dönüşüm |
| Platform format kurallarını bilmemek | Kanal-spesifik prompt şablonları (otomatik) |
| Uzun bekleme süresi | Streaming çıktı, aşamalı loading mesajları |
| Çıktıyı hemen kullanmak | Kopyala butonu + karakter sayacı |
| API kurulumu karmaşıklığı | Onboarding diyaloğu + test bağlantısı |

### Teknik Gereksinimler

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Groq API (`groq-sdk` npm, `llama-3.3-70b-versatile`), streaming zorunlu
- API anahtarı `.env.local` üzerinden, yalnızca server-side
- Soyut AI provider katmanı (Groq dışı sağlayıcılar için hazır)
- Zod ile API boundary validasyonu

### Riskler ve Azaltma

| Risk | Etki | Azaltma |
|------|------|---------|
| Groq rate limit (free tier ~30 req/dk) | Demo sırasında hata | Exponential backoff, "Tekrar dene" UX |
| Uzun makale token limiti | Kesik/hatalı çıktı | Giriş karakter sayacı + 4000+ uyarı |
| Generic AI chat hissi | Ürün algısı düşer | Yapılandırılmış form, platform kartları |
| Scope creep | Süre aşımı | MVP/V2/Future ayrımı, `progress-tracker.md` fazları |

### Rakip Araştırması — Özet

Rakipler kopyalanmaz; başarılı UX kalıpları ürüne uyarlanır:

- **Jasper AI:** Kanal-spesifik ton/format ayarı → platform kartlarında limit ve format ipucu
- **Copy.ai:** Girdi → işleme → çıktı pipeline görünürlüğü → 3 adımlı stepper
- **Buffer AI:** Channel-aware prompts, Rephrase/Shorten/Expand → çıktı mikro-aksiyonları (V2)
- **Writesonic / Notion AI:** Boş durumda örnek içerik, split-view layout
- **HubSpot / Grammarly:** Ton seçici, hedef kitle → Gelişmiş Ayarlar paneli

## Scope

### In Scope

- Lokal Next.js web uygulaması (Türkçe arayüz)
- 8 platform formatı (MVP listesi)
- Groq API entegrasyonu, streaming SSE
- AI provider abstraction (yalnızca Groq implementasyonu)
- Kaynak metin girişi (yapıştır + dosya yükleme)
- Ton, hedef kitle, uzunluk ayarları
- API key onboarding ve health check
- Teslim paketi: README, 3 örnek çıktı, prompt açıklaması
- UX state'leri: empty, loading, streaming, success, error
- Erişilebilirlik: klavye navigasyonu, aria-label, WCAG AA kontrast

### Out of Scope

- Authentication ve kullanıcı hesabı sistemi
- Çok kullanıcılı yapı
- Cloud / production deployment
- CI/CD pipeline
- Docker zorunluluğu
- Monitoring altyapısı
- Kubernetes / mikroservis mimarisi
- Veritabanı (MVP'de yok; V2'de yalnızca localStorage)
- AI Destekli İçerik Üretici (Ender'in görevi — bu repo kapsamı dışında)

## Success Criteria

1. Kullanıcı kaynak metni yapıştırıp platform seçerek 3 tıklamada anlamlı çıktı alabilir.
2. MVP'deki 8 platform formatının tamamı streaming ile çalışır.
3. API anahtarı client tarafına sızmaz; tüm AI çağrıları server route üzerinden yapılır.
4. Hata durumları Türkçe, anlaşılır ve aksiyon önerisi içerir.
5. Demo'da 3 farklı kaynak + 3 farklı platform canlı gösterilebilir.
6. Teslim paketi eksiksizdir: kaynak kod, README, en az 3 örnek çıktı, prompt açıklaması.
7. `npm run build` hatasız tamamlanır.

## Related Documents

- Mimari ve dosya yapısı: `architecture.md`
- AI prompt şablonları ve Groq konfigürasyonu: `ai-workflow-rules.md`
- Tasarım sistemi ve UX kuralları: `ui-context.md`
- Kod standartları: `code-standards.md`
- Geliştirme durumu: `progress-tracker.md`
