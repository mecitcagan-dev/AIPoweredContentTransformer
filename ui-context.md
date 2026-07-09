# UI Context

## Theme

Dark-first profesyonel workspace teması. Tasarım dili koyu teknik çalışma alanı hissi verir: neredeyse siyah arka planlar, katmanlı yüzeyler ve etkileşimli öğelerde canlı vurgu renkleri. MVP'de yalnızca karanlık tema; aydınlık tema V2'de eklenecek.

Tüm bileşenler `ui-context.md` token'larını kullanır; hardcoded hex değer yasaktır (`code-standards.md`).

## Colors

| Role              | CSS Variable         | Value     | Kullanım                          |
| ----------------- | -------------------- | --------- | --------------------------------- |
| Page background   | `--bg-base`          | `#0a0a0f` | Ana sayfa arka planı              |
| Surface           | `--bg-surface`       | `#14141f` | Kartlar, paneller                 |
| Surface elevated  | `--bg-elevated`      | `#1c1c2e` | Hover, seçili kart, dropdown      |
| Primary text      | `--text-primary`     | `#f4f4f5` | Başlıklar, gövde metni            |
| Muted text        | `--text-muted`       | `#a1a1aa` | Placeholder, yardımcı metin       |
| Primary accent    | `--accent-primary`   | `#6366f1` | CTA, seçili durum, focus ring     |
| Accent hover      | `--accent-hover`     | `#818cf8` | Buton hover                       |
| Border            | `--border-default`   | `#27272a` | Panel ayırıcıları, input border   |
| Border focus      | `--border-focus`     | `#6366f1` | Focus durumu                      |
| Error             | `--state-error`      | `#ef4444` | Hata mesajları, validasyon        |
| Error surface     | `--state-error-bg`   | `#450a0a` | Hata alert arka planı             |
| Success           | `--state-success`    | `#22c55e` | Başarı toast, onay                |
| Warning           | `--state-warning`    | `#f59e0b` | Uzun metin uyarısı (4000+ kar.)   |
| Streaming cursor  | `--accent-primary`   | `#6366f1` | Yanıp sönen imleç animasyonu      |

## Typography

| Role       | Font        | Variable      | Tailwind class   |
| ---------- | ----------- | ------------- | ---------------- |
| UI text    | Geist Sans  | `--font-sans` | `font-sans`      |
| Code/mono  | Geist Mono  | `--font-mono` | `font-mono`      |

| Element            | Size    | Weight   | Class                          |
| ------------------ | ------- | -------- | ------------------------------ |
| Page title         | 24px    | 600      | `text-2xl font-semibold`       |
| Section label      | 14px    | 500      | `text-sm font-medium`          |
| Body               | 14px    | 400      | `text-sm`                      |
| Helper/counter     | 12px    | 400      | `text-xs text-muted`           |
| Output content     | 15px    | 400      | `text-[15px] leading-relaxed`  |
| Button             | 14px    | 500      | `text-sm font-medium`          |

## Border Radius

| Context              | Class          |
| -------------------- | -------------- |
| Inline / small UI    | `rounded-md`   |
| Cards / panels       | `rounded-lg`   |
| Modals / overlays    | `rounded-xl`   |
| Platform kartları    | `rounded-lg`   |
| Badge                | `rounded-full` |

## Component Library

shadcn/ui on top of Tailwind CSS 4. Bileşenler `components/ui/` altında yaşar; CLI ile eklenir, doğrudan düzenlenmez.

**MVP'de kullanılacak bileşenler:**

- Button, Textarea, Card, Badge, Toast (Sonner), Dialog, Select, Tooltip, Skeleton, Collapsible, Alert

## Layout Patterns

### Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────┐
│ Header: Logo + "İçerik Dönüştürücü" + Ayarlar ikonu        │
├──────────────────────────┬──────────────────────────────────┤
│ Kaynak Panel (45%)       │ Çıktı Panel (55%)                │
│ - Panel başlığı          │ - Platform badge                 │
│ - Textarea (min-h 320px) │ - Streaming output area          │
│ - Karakter/kelime sayacı │ - Çıktı karakter sayacı          │
│ - Dosya yükle butonu     │ - Kopyala butonu                 │
├──────────────────────────┴──────────────────────────────────┤
│ TransformModeSelector: mod seçimi (bundle varsayılan)       │
│ TransformStepper: Kaynak → Ayarlar/Paket → Sonuç            │
│ [single] PlatformSelector: yatay scroll kart grid           │
│ TransformSettings: collapsible (ton, kitle, uzunluk)        │
│ TransformButton: full-width primary CTA                     │
└─────────────────────────────────────────────────────────────┘
```

**TransformModeSelector konumu:** Alt kontrol panelinin en üstünde, `TransformStepper`'dan hemen önce; tam genişlik segmented control. Bundle modunda `PlatformSelector` gizlenir; `TransformSettings` ve `TransformButton` her iki modda görünür. Sağ panel bundle modunda `BundleOutputPanel` (içinde `BundleProgressBar`), single modunda `OutputPanel` gösterir.

### Tablet (768px–1023px)

- Kaynak ve çıktı panelleri dikey stack (kaynak üstte)
- Platform kartları 2 sütun grid

### Mobile (<768px)

- Tam dikey stack: Kaynak → Mod seçici → Stepper → [Platform] → Ayarlar → Dönüştür → Çıktı
- Platform kartları yatay scroll
- Header kompakt (yalnızca logo + başlık)

### Genel Kurallar

- **Editor layout:** Full-viewport split (desktop); paneller `--bg-surface` arka plan, `--border-default` ayırıcı
- **Sidebars/panels:** Sabit oran (45/55), `border-r border-default`
- **Modals:** Merkez overlay, `backdrop-blur-sm`, `--bg-surface` arka plan
- **Navbar/Header:** Üst bar, `border-b border-default`, yükseklik 56px

## Icons

Lucide React. Stroke-based ikonlar only.

| Bağlam              | Size          | Örnek ikonlar                    |
| ------------------- | ------------- | -------------------------------- |
| Inline / label      | `h-4 w-4`     | FileText, Settings, Copy         |
| Button              | `h-4 w-4`     | ArrowRight, RefreshCw, Upload    |
| Platform kartları   | `h-5 w-5`     | Linkedin, Twitter, Instagram     |
| Empty state         | `h-12 w-12`   | Sparkles, FileQuestion           |

## User Journey

```
İlk Açılış → API Key var mı?
  ├─ Hayır → OnboardingDialog (Groq link, .env.local talimatı, test)
  └─ Evet → Ana Ekran
       → İçerik gir (yapıştır / dosya / örnek)
       → Platform seç
       → [Opsiyonel] Gelişmiş Ayarlar
       → Dönüştür
       → Streaming çıktı
       → Memnun mu?
            ├─ Evet → Kopyala → Başka platform?
            └─ Hayır → Yeniden üret (V2) / farklı ayarlarla tekrar
```

## First Time User Experience (FTUE)

1. **API key yok:** `OnboardingDialog` otomatik açılır. İçerik: Groq Console linki, `.env.local` oluşturma adımları, "Bağlantıyı Test Et" butonu. Kapatılamaz (anahtar doğrulanana kadar). `.env.local` kaydedildikten sonra dev server otomatik yeniden başlayabilir; ilk test isteği geçici başarısız olursa Error UX tablosundaki "İlk bağlantı testi" mesajı gösterilir.
2. **API key var, ilk kullanım:** 3 adımlık tooltip turu (atlanabilir): (1) Kaynak yapıştır, (2) Platform seç, (3) Dönüştür.
3. **Boş kaynak paneli:** "Örnek makale yükle" ghost butonu + açıklayıcı placeholder metni.

## UX State Matrix

### Kaynak Paneli

| State    | Görünüm | Davranış |
| -------- | ------- | -------- |
| Empty    | Placeholder + "Örnek makale yükle" CTA | Textarea boş, sayaç 0 |
| Filled   | Normal textarea | Karakter/kelime sayacı aktif |
| Warning  | Sarı banner (4000+ karakter) | "Uzun metinlerde dönüşüm kalitesi düşebilir" |
| Error    | Kırmızı inline mesaj | "En az 50 karakter girin" (submit engellenir) |

**Textarea davranışı:** Sabit min-height (320px) korunur, ayrıca max-height (480px) tanımlanır. İçerik max-height'ı aştığında textarea büyümeyi durdurur, içeride dikey scroll (`overflow-y-auto`) aktif olur. Bu sayede panel yüksekliği sabit kalır; karakter sayacı ve 4000+ uyarı banner'ı her zaman görünür alanda kalır, kullanıcı ayrıca sayfa scroll etmek zorunda kalmaz.

### Çıktı Paneli

| State     | Görünüm | Davranış |
| --------- | ------- | -------- |
| Empty     | İllüstrasyon + "Platform seçip dönüştürün" | Kopyala butonu disabled |
| Loading   | Skeleton shimmer (3 satır) + durum mesajı | Metin alanı read-only |
| Streaming | Token-by-token metin + yanıp sönen cursor | Otomatik scroll (kullanıcı scroll etmediyse) |
| Complete  | Tam metin + aktif Kopyala butonu | Karakter sayacı güncel |
| Error     | Kırmızı Alert + "Tekrar Dene" butonu | Önceki çıktı temizlenir |

### Bundle Output UX State Matrix

Bundle modu çıktı paneli 5 kart + üstte `BundleProgressBar` içerir: **SEO Başlık**, **Meta Açıklama**, **LinkedIn Post**, **X Thread**, **Instagram Caption**. SEO kartları `seo-meta` section'ından `parseSeoMeta` ile türetilir; sosyal kartlar ilgili section `content`'ini gösterir.

#### Panel genel durumları

| State          | Görünüm | Davranış |
| -------------- | ------- | -------- |
| Empty (idle)   | İllüstrasyon + "Kaynak metin girip paketi dönüştürün" | Tüm kartlar pending placeholder; progress bar nötr |
| Loading        | Tüm kartlar skeleton + progress bar ilk adım (SEO) aktif | Read-only; kopyala disabled |
| Streaming      | Aktif section kartında `--accent-primary` border + streaming cursor; tamamlanan kartlar dolu | Otomatik scroll aktif karta (kullanıcı scroll etmediyse) |
| Complete       | 5 kart dolu; her tamamlanmış kartta kopyala aktif | Progress bar tüm adımlar checkmark |
| Partial Error  | Tamamlanan kartlar dolu + kopyalanabilir; hata kartı kırmızı Alert; sonraki kartlar "Üretilmedi" | Panel altı global Alert + Tekrar Dene → tüm bundle sıfırdan |
| Error          | Hiç section tamamlanmadıysa global Alert (single error gibi) | Tekrar Dene |

#### Kart bazlı durumlar (her section)

| Section durumu | Görünüm | Token / stil | Davranış |
| -------------- | ------- | ------------ | -------- |
| pending        | Boş placeholder veya skeleton satırları | `--bg-elevated`, `--text-muted` | "Üretilmedi" (partial error sonrası) veya boş bekleyen alan |
| streaming      | Kısmi metin + yanıp sönen cursor | Border `--accent-primary`, cursor `--accent-primary` | İçerik token-by-token birikir; kopyala disabled |
| complete       | Tam metin + karakter sayacı | Border `--border-default`, check ikonu veya muted border | Kopyala aktif |
| error          | Kırmızı inline Alert + varsa kısmi içerik | `--state-error`, `--state-error-bg` | Kopyala yalnızca içerik varsa aktif |

#### SEO kartları (SEO Başlık / Meta Açıklama)

| Kart | Kaynak | Sayaç |
| ---- | ------ | ----- |
| SEO Başlık | `bundleOutput.seoTitle` (complete) veya `parseSeoMeta(seo-meta content).title` (streaming) | `X/60` |
| Meta Açıklama | `bundleOutput.seoDescription` (complete) veya parse fallback (streaming) | `X/155` |

Her iki kartın section durumu `bundleOutput.sections["seo-meta"].status` ile senkron kalır.

#### Sosyal kartları (LinkedIn / X Thread / Instagram)

| Kart | Section id | Sayaç |
| ---- | ---------- | ----- |
| LinkedIn Post | `linkedin` | Platform limiti (`platforms.ts`) |
| X Thread | `twitter-thread` | Platform limiti |
| Instagram Caption | `instagram` | Platform limiti |

#### BundleProgressBar (4 aşama)

Yatay sıra: **SEO** → **LinkedIn** → **X** → **Instagram** (`BUNDLE_SECTIONS` sırası). State `bundleOutput.sections` üzerinden türetilir; bileşen kendi state tutmaz.

| Aşama durumu | Görsel | Token |
| ------------ | ------ | ----- |
| pending      | Nötr dolu nokta | `--border-default` / `--text-muted` |
| streaming    | Spinner veya pulse nokta | `--accent-primary` |
| complete     | Checkmark ikonu | `--state-success` |
| error        | X ikonu | `--state-error` |

Adımlar arası ince bağlayıcı çizgi `--border-default`. Global `loading` durumunda ilk adım (SEO) streaming olarak gösterilir.

### Loading / AI Waiting Experience

Aşamalı durum mesajları (her 2 saniyede döner):

1. "İçerik analiz ediliyor..."
2. "Platform formatına uyarlanıyor..."
3. "Son dokunuşlar yapılıyor..."

Skeleton: 3 satır, `animate-pulse`, `--bg-elevated` renk.

Streaming cursor: `|` karakteri, `animate-pulse`, `--accent-primary` renk.

### Success UX

- Kopyala tıklandığında: yeşil toast "Panoya kopyalandı" (2 saniye, Sonner)
- Kopyala butonu geçici olarak check ikonuna dönüşür (1.5 saniye)

### Error UX

| Hata türü        | Mesaj (Türkçe)                                      | Aksiyon              |
| ---------------- | --------------------------------------------------- | -------------------- |
| İlk bağlantı testi (dev restart) | "Sunucu yeniden başlatılıyor olabilir, birkaç saniye sonra tekrar deneyin." | Test Et butonunu tekrar dene (yalnızca henüz hiç başarılı health check yapılmamışsa) |
| API key eksik    | "API anahtarı bulunamadı. Ayarlardan yapılandırın." | OnboardingDialog aç  |
| Rate limit (429) | "Çok fazla istek. Lütfen biraz bekleyip tekrar deneyin." | Tekrar Dene butonu |
| Ağ hatası        | "Bağlantı hatası. İnternet bağlantınızı kontrol edin." | Tekrar Dene       |
| Sunucu hatası    | "Bir hata oluştu. Lütfen tekrar deneyin."           | Tekrar Dene          |
| Validasyon       | "Lütfen en az 50 karakterlik bir kaynak metin girin." | Inline field error |

### Platform Selector

| State    | Görünüm |
| -------- | ------- |
| Default  | Kart grid, hover'da `--bg-elevated` |
| Selected | `--accent-primary` border + hafif accent arka plan |
| Disabled | Opacity 50%, tıklanamaz (loading sırasında) |

## Micro Interactions

- Platform kartı seçimi: 150ms scale(0.98) → scale(1) spring
- Dönüştür butonu: loading'de spinner + "Dönüştürülüyor..." metni
- Kopyala: ripple yok; ikon morph (Copy → Check)
- Collapsible ayarlar: 200ms height transition
- Toast: slide-in from bottom-right, 200ms

`prefers-reduced-motion: reduce` aktifse tüm animasyonlar devre dışı.

## Minimum Click Experience

Hedef: Anlamlı çıktı için **3 tıklama**.

1. Kaynak metni yapıştır (veya örnek yükle — 1 tık)
2. Platform kartına tıkla
3. "Dönüştür"e tıkla

Ton, hedef kitle ve uzunluk varsayılan değerlerle gelir (Profesyonel, Genel, Orta). Gelişmiş Ayarlar kapalı başlar.

## Accessibility

- Tüm interaktif öğelerde `aria-label` (Türkçe)
- Platform kartları: `role="radio"`, `aria-checked`
- Textarea: `aria-describedby` ile sayaç ve hata mesajına bağlantı
- Klavye: Mantıklı Tab sırası (kaynak → platformlar → ayarlar → dönüştür → kopyala)
- Enter: Textarea dışındayken Dönüştür'ü tetikler; textarea içindeyken yeni satır
- Escape: Açık dialog'u kapatır
- Focus ring: `ring-2 ring-accent-primary ring-offset-2 ring-offset-bg-base`
- Renk kontrastı: WCAG AA (4.5:1 metin, 3:1 büyük metin)
- `prefers-reduced-motion`: Animasyonları kapat

## Tooltips

- Platform kartları: Hover'da format ipucu (ör. "Max 3000 karakter, hook + CTA + hashtag")
- Dosya yükle: "TXT veya MD dosyası yükleyin"
- Ayarlar ikonu: "API anahtarı yapılandırması"
- Karakter sayacı (çıktı): Platform limitine göre renk (yeşil → sarı → kırmızı)

## Responsive Breakpoints

| Breakpoint | Min width | Layout değişikliği              |
| ---------- | --------- | ------------------------------- |
| sm         | 640px     | Butonlar full-width → auto      |
| md         | 768px     | Dikey → yarı dikey stack        |
| lg         | 1024px    | Split panel (45/55)             |
| xl         | 1280px    | Max-width container (1280px)    |

## Related Documents

- Ürün akışı ve özellik listesi: `project-overview.md`
- Mimari ve API: `architecture.md`
- Kod ve stil kuralları: `code-standards.md`
