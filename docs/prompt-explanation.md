# Prompt Mühendisliği Açıklaması

Bu belge, İçerik Dönüştürücü'nün AI katmanında kullanılan prompt mimarisini açıklar. Tüm şablonlar `ai-workflow-rules.md` SSOT belgesine ve `lib/ai/prompts/` kod dosyalarına dayanır.

## 3 Katmanlı Prompt Mimarisi

Her dönüşüm isteği üç katmandan oluşur; birleştirme `lib/ai/prompt-engine.ts` içindeki `buildMessages()` fonksiyonunda yapılır:

```
messages = [
  { role: "system", content: SYSTEM_PROMPT + PLATFORM_PROMPT },
  { role: "user",   content: buildUserPrompt(source, tone, audience, length) }
]
```

**Neden üç katman?** Tek monolitik prompt yerine sorumluluklar ayrılır: genel davranış kuralları bir kez yazılır (`system.ts`), kanal formatları platform başına güncellenir (`linkedin.ts`, `twitter-thread.ts`, …), runtime parametreleri ise her istekte dinamik üretilir. Bu yapı hem prompt kalitesini hem de bakımı iyileştirir — yeni platform eklemek yalnızca yeni bir `lib/ai/prompts/{platform}.ts` dosyası gerektirir.

| Katman   | Kaynak dosya                          | Sorumluluk |
| -------- | ------------------------------------- | ---------- |
| System   | `lib/ai/prompts/system.ts`            | Rol tanımı, dil koruma, halüsinasyon önleme, meta yorum yasağı |
| Platform | `lib/ai/prompts/{platform}.ts`        | Kanal formatı, karakter limiti, yapısal kurallar (hook, CTA, hashtag vb.) |
| User     | `buildUserPrompt()` — prompt-engine   | Kaynak metin + ton + hedef kitle + uzunluk talimatları |

## Kanal-Spesifik Strateji: LinkedIn vs X Thread

Aynı kaynak metin farklı platformlarda farklı yapısal kurallar gerektirir. İki örnek:

### LinkedIn Post (`lib/ai/prompts/linkedin.ts`)

- **Limit:** 3000 karakter (tek blok)
- **Yapı:** Güçlü hook → 2–4 kısa paragraf (boş satırlı) → CTA → 3–5 hashtag
- **Kısıt:** Madde işareti yok; akıcı paragraflar. Emoji minimal (2–3)

LinkedIn profesyonel ağ bağlamında uzun form anlatım ve etkileşim (yorum/CTA) bekler; prompt bu beklentiyi yapısal olarak zorlar.

### X Thread (`lib/ai/prompts/twitter-thread.ts`)

- **Limit:** Tweet başına 280 karakter
- **Yapı:** 3–7 numaralı tweet (`1/`, `2/`, …); ilk tweet hook; son tweet CTA + en fazla 2 hashtag
- **Kısıt:** Her tweet bağımsız okunabilir ama bütün hikâye anlatır; emoji tweet başına en fazla 1

X formatı atomik, kısa birimler ve dizi okuma deneyimi gerektirir. LinkedIn'deki paragraf modeli burada çalışmaz; prompt modeli tweet sınırlarına ve numaralandırmaya kilitleyerek format sapmasını önler.

Bu ayrım, generic "sosyal medya postu yaz" talimatının ürettiği belirsiz çıktıyı ortadan kaldırır.

## Ton ve Uzunluk Eşlemesi

UI'daki seçimler doğrudan modele gönderilmez; `prompt-engine.ts` içinde anlamlı talimatlara çevrilir:

**Ton** (`TONE_PROMPT_VALUES`):

| UI          | Prompt talimatı                                      |
| ----------- | ---------------------------------------------------- |
| Profesyonel | Resmi, güvenilir, sektörel dil; jargon ölçülü        |
| Samimi      | Sıcak, sohbet havasında, "sen" dili                  |
| İkna Edici  | Harekete geçirici, fayda odaklı, güçlü CTA           |

**Uzunluk** (`LENGTH_INSTRUCTIONS`):

| UI   | Prompt talimatı                              |
| ---- | -------------------------------------------- |
| Kısa | Platform limitinin %40'ına yakın, öz         |
| Orta | Platform limitinin %70'ine yakın, dengeli    |
| Uzun | Platform limitine yakın, detaylı           |

Bu eşleme user prompt şablonuna gömülür:

```
Ton: {mapToneToPrompt(tone)}
Hedef kitle: {audience || "Genel okuyucu"}
Uzunluk: {mapLengthToPrompt(length)}
```

Böylece platform prompt'u formatı tanımlarken, user katmanı çıktının ne kadar kısa/uzun ve hangi ses tonunda olacağını belirler — iki boyut birbirinden bağımsız kalır.

## "Yeni İçerik Üretme, Mevcut İçeriği Koru" Kuralı

`system.ts` ilk cümlede rolü net tanımlar: *"Yeni içerik icat etmezsin; kaynak metindeki bilgileri, argümanları ve mesajı koruyarak hedef platformun formatına uyarlırsın."*

Bu kural kritiktir çünkü:

1. **Halüsinasyon riski:** Serbest üretim modunda model uydurma istatistik, alıntı veya iddia ekleyebilir. Kaynak-koruma kuralı bunu sistematik olarak bastırır.
2. **Ürün konumlandırması:** Uygulama bir AI sohbet aracı değil, yeniden paketleme aracıdır (`project-overview.md`). Kullanıcı kendi içeriğinin farklı kanallara uyarlanmasını bekler; sıfırdan makale yazılmasını değil.
3. **Güvenilirlik:** İçerik pazarlamacıları ve SMM'ler marka tutarlılığı ister; kaynak metindeki gerçeklerin korunması değerlendirme kriteridir.

Kural 1 açıkça yasaklar: *"Uydurma bilgi, istatistik veya alıntı ekleme."* Kural 7 ise çıktıyı temiz tutar: meta açıklama veya *"İşte dönüştürülmüş içerik:"* gibi ön ekler üretilmez.

## İlgili Dosyalar

- `lib/ai/prompts/system.ts` — System prompt
- `lib/ai/prompts/index.ts` — Platform lookup (`PLATFORM_PROMPTS`)
- `lib/ai/prompts/linkedin.ts`, `twitter-thread.ts`, … — Kanal şablonları
- `lib/ai/prompt-engine.ts` — `buildUserPrompt()`, `buildMessages()`
- `lib/ai/providers/groq-provider.ts` — Streaming API çağrısı
- `ai-workflow-rules.md` — SSOT prompt kuralları
