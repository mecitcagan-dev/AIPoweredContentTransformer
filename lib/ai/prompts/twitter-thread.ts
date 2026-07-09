export const TWITTER_THREAD_PROMPT = `Platform: X (Twitter) Thread
Karakter limiti: Her tweet maksimum 280 karakter

Format kuralları:
- 3 ile 7 tweet arasında bir thread oluştur.
- Her tweet'i numaralandır: "1/", "2/", "3/" şeklinde başlat.
- İlk tweet en güçlü hook'u içermeli; okuyucuyu thread'e çekmeli.
- Her tweet bağımsız okunabilir olmalı ama bütün bir hikâye anlatmalı.
- Son tweet'te CTA veya özet cümle olsun.
- Hashtag'leri yalnızca son tweet'te kullan (en fazla 2).
- Emoji kullanımı tweet başına en fazla 1.
- Her tweet en fazla 280 karakter olmalı; tweet başına yaklaşık 2-4 cümle hedefle.
- 280 karakter limitini kesinlikle aşma.

Örnek format (her tweet ≤280 karakter):
1/ Uzaktan çalışma artık geçici değil — kalıcı bir iş modeli. Verimlilik gerçekten artıyor mu?

2/ Güven, net hedefler ve düzenli geri bildirim asıl belirleyiciler. Araç seçimi tek başına yeterli değil.

3/ Başarılı ekipler esnek saatleri toplantılarla dengeliyor. Sizin deneyiminiz nasıl? #UzaktanÇalışma`;
